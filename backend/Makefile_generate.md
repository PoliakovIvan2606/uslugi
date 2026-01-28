.PHONY: all clean

run:
	go run main.go

image.png:
	export IAM_TOKEN=$$(yc iam create-token) && \
	curl --request GET --header "Authorization: Bearer $${IAM_TOKEN}" \
	  "https://llm.api.cloud.yandex.net/operations/fbvvjj1bmqdlnegqdgle" \
	  | jq -r '.response.image' | base64 -d > $@

image:
	export IAM_TOKEN=$(yc iam create-token) && \
	curl --request GET \
	--header "Authorization: Bearer ${IAM_TOKEN}" \
	--data "@prompt.json" \
	"https://llm.api.cloud.yandex.net/operations/fbvvjj1bmqdlnegqdgle" \
	| jq -r '.response.image' | base64 -d > image.png

generate:
	export IAM_TOKEN=$(yc iam create-token)
	
	curl \
		--request POST \
		--header "Authorization: Bearer ${IAM_TOKEN}" \
		--data "@json/prompt.json" \
		"https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync"

get:
	export IAM_TOKEN=$(yc iam create-token)
	curl --request GET --header "Authorization: Bearer ${IAM_TOKEN}" https://llm.api.cloud.yandex.net:443/operations/fbvabkl496163rmeiht8 | jq -r '.response | .image' | base64 -d > ../../image/image1.jpeg

