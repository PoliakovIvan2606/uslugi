import contextlib
from datetime import date
from typing import AsyncGenerator, List, Optional
from fastapi import FastAPI, HTTPException, Query, Path
from pydantic import BaseModel, Field
import psycopg2
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware

DB_PARAMS = {
    "host": "localhost",
    "port": 5432,
    "database": "uslugi",
    "user": "postgres",
    "password": "password",
}

ml_models = {}


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    ml_models["vector_model"] = SentenceTransformer(
        "sentence-transformers/distiluse-base-multilingual-cased-v1"
    )
    yield
    ml_models.clear()


app = FastAPI(title="Vector Recommendation API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Схема для валидации возвращаемых ЗАДАЧ (Tasks)
class TaskRecommendation(BaseModel):
    id: str
    user_id: int = Field(..., alias="userId")
    title: str
    description: str
    full_description: str = Field(..., alias="fullDescription")
    category: str
    budget: int
    author: str
    date: date
    deadline: date
    phone: str
    email: str
    location: str
    requirements: Optional[List[str]] = None

    class Config:
        populate_by_name = True


# Исходная схема для УСЛУГ (осталась без изменений)
class ServiceRecommendation(BaseModel):
    id: str
    user_id: int = Field(..., alias="userId")
    title: str
    description: str
    full_description: str = Field(..., alias="fullDescription")
    category: str
    budget: int
    author: str
    date: date
    deadline: date
    phone: str
    email: str
    location: str
    requirements: Optional[list] = None

    class Config:
        populate_by_name = True


# --- ЭНДПОИНТ 1: Поиск услуг по текстовому запросу (Ваш исходный) ---
@app.get("/api/v1/recommendations", response_model=List[ServiceRecommendation])
async def get_recommendations(
    query: str = Query(..., min_length=1, description="Поисковый запрос для рекомендаций")
):
    vector_model = ml_models.get("vector_model")
    if not vector_model:
        raise HTTPException(status_code=500, detail="Модель не инициализирована.")

    query_embedding = vector_model.encode(query).tolist()

    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, user_id, name, short_description, all_description, 
                   category, price, name_specialist, phone, email, location
            FROM service
            ORDER BY embedding <=> %s::vector
            LIMIT 10;
            """,
            (query_embedding,),
        )
        rows = cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка БД: {str(e)}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

    return [
        ServiceRecommendation(
            id=str(r[0]), userId=r[1], title=r[2], description=r[3],
            fullDescription=r[4] if r[4] else "", category=r[5], budget=r[6],
            author=r[7], date=date.today(), deadline=date.today(),
            phone=r[8], email=r[9], location=r[10], requirements=None
        ) for r in rows
    ]


# --- ЭНДПОИНТ 2: Подбор ЗАДАЧ для конкретной УСЛУГИ по её ID ---
@app.get("/api/v1/recommendations/service/{service_id}", response_model=List[TaskRecommendation])
async def get_tasks_for_service(
    service_id: int = Path(..., description="ID услуги, для которой подбираются задачи")
):
    vector_model = ml_models.get("vector_model")
    if not vector_model:
        raise HTTPException(status_code=500, detail="Модель не инициализирована.")

    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()

        # Шаг 1: Получаем текстовые поля целевой услуги
        cursor.execute(
            """
            SELECT name, short_description, all_description 
            FROM service 
            WHERE id = %s;
            """,
            (service_id,),
        )
        service_row = cursor.fetchone()

        if not service_row:
            raise HTTPException(status_code=404, detail="Указанная услуга не найдена.")

        name, short_desc, all_desc = service_row
        
        # Шаг 2: Конкатенируем строки для получения точного семантического контекста
        combined_text = f"{name}. {short_desc}. {all_desc if all_desc else ''}"
        
        # Генерируем вектор из полученного текста услуги
        service_embedding = vector_model.encode(combined_text).tolist()

        # Шаг 3: Ищем похожие задачи в таблице tasks по сгенерированному вектору
        cursor.execute(
            """
            SELECT 
                id, user_id, title, short_description, all_description, category, 
                budget, author, date, deadline, phone, email, location, requirements
            FROM tasks
            ORDER BY embedding <=> %s::vector
            LIMIT 5; -- Возвращаем топ-5 подходящих задач
            """,
            (service_embedding,),
        )
        task_rows = cursor.fetchall()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при поиске рекомендаций: {str(e)}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

    # Маппинг результатов в схему TaskRecommendation
    tasks = []
    for row in task_rows:
        (
            t_id, u_id, title, s_desc, a_desc, cat, 
            budget, author, t_date, deadline, phone, email, loc, reqs
        ) = row
        
        tasks.append(
            TaskRecommendation(
                id=str(t_id),
                userId=u_id,
                title=title,
                description=s_desc,
                fullDescription=a_desc if a_desc else "",
                category=cat,
                budget=budget,
                author=author,
                date=t_date,
                deadline=deadline,
                phone=phone,
                email=email,
                location=loc,
                requirements=reqs if reqs else None
            )
        )

    return tasks

# --- ЭНДПОИНТ 3: Подбор УСЛУГ для конкретной ЗАДАЧИ по её ID ---
@app.get("/api/v1/recommendations/task/{task_id}", response_model=List[ServiceRecommendation])
async def get_services_for_task(
    task_id: int = Path(..., description="ID задачи, для которой подбираются услуги")
):
    # Достаем прогретую модель из кэша ml_models
    vector_model = ml_models.get("vector_model")
    if not vector_model:
        raise HTTPException(status_code=500, detail="Модель не инициализирована.")

    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()

        # Шаг 1: Получаем текстовые поля целевой задачи
        cursor.execute(
            """
            SELECT title, short_description, all_description 
            FROM tasks 
            WHERE id = %s;
            """,
            (task_id,),
        )
        task_row = cursor.fetchone()

        if not task_row:
            raise HTTPException(status_code=404, detail="Указанная задача не найдена.")

        title, short_desc, all_desc = task_row
        
        # Шаг 2: Конкатенируем строки для получения точного семантического контекста задачи
        combined_text = f"{title}. {short_desc}. {all_desc if all_desc else ''}"
        
        # Генерируем вектор из полученного текста задачи
        task_embedding = vector_model.encode(combined_text).tolist()

        # Шаг 3: Ищем похожие услуги в таблице service по сгенерированному вектору задачи
        cursor.execute(
            """
            SELECT 
                id, user_id, name, short_description, all_description, 
                category, price, name_specialist, phone, email, location
            FROM service
            ORDER BY embedding <=> %s::vector
            LIMIT 5; -- Возвращаем топ-5 подходящих услуг
            """,
            (task_embedding,),
        )
        service_rows = cursor.fetchall()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при поиске рекомендаций услуг: {str(e)}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

    # Маппинг результатов в схему ServiceRecommendation под ваш интерфейс фронтенда
    services = []
    for row in service_rows:
        (
            s_id, u_id, name, s_desc, a_desc, 
            cat, price, specialist, phone, email, loc
        ) = row
        
        services.append(
            ServiceRecommendation(
                id=str(s_id),
                userId=u_id,
                title=name,
                description=s_desc,
                fullDescription=a_desc if a_desc else "",
                category=cat,
                budget=price,             # Маппится в budget, как требует ваша схема фронтенда
                author=specialist,        # Имя специалиста как автор
                date=date.today(),        # Заглушка даты под схему фронта
                deadline=date.today(),    # Заглушка дедлайна под схему фронта
                phone=phone,
                email=email,
                location=loc,
                requirements=None
            )
        )

    return services