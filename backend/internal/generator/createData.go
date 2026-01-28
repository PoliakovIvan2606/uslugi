package generator


type Data struct {
	FoldarId string `json:"folderId"`
	ModelUri string `json:"modelUri"`
	GenerationOptions GenerationOptions `json:"generationOptions"`
	Messages []Message `json:"messages"`
}

type GenerationOptions struct {
	Seed string `json:"seed"`
	AspectRatio AspectRatio `json:"aspectRatio"`
}

type AspectRatio struct {
	WidthRatio string `json:"widthRatio"`
	HeightRatio string `json:"heightRatio"`
}

type Message struct {
	Text string `json:"text"`
}

func CreateData(textUser string) *Data {
	// const textPrompt = "сделай обложку для магазина услуги и заказы. описание карточки такое: "
	const textPrompt = ""
	const folderId = "b1g4ojkqbdpfc8b4pd5h"
	const modelUri = "art://b1g4ojkqbdpfc8b4pd5h/yandex-art/latest"
	const seed = "1863"
	const widthRatio = "21"
	const heightRatio = "9"


	data := Data{
		FoldarId: folderId, 
		ModelUri: modelUri,
		GenerationOptions: GenerationOptions{
			Seed: seed,
			AspectRatio: AspectRatio{
				WidthRatio: widthRatio,
				HeightRatio: heightRatio,
			},
		},
		Messages: []Message{
			Message{
				Text: textPrompt + textUser,
			},
		},
	}

	return &data
}
