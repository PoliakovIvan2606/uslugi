package models

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestValidate(t *testing.T) {
	in := AddServiceRequest{
		Name:             "name",
		ShortDescription: "ShortDescription",
		AllDescription:   "allDescription",
		Category:         "category",
		Price:            100,
		NameSpecialist:   "Ivan",
		Experience:       10,
		Phone:            "89664519856",
		Email: "poliakov@mail.ru",
		Location:      "Moscow",
		GenerateImage: true,
	}

	err := in.Validate()

	require.NoError(t, err)
}

func TestValidateError(t *testing.T) {
	cases := []struct{
		name string
		in AddServiceRequest
		expErr error
	}{
		{
			name: "incorect_structure_request",
			in: AddServiceRequest{
				Name: "name",
			},
			expErr: ErrEmptyField,
		},
		{
			name: "null_field",
			in: AddServiceRequest{
				Name:             "",
				ShortDescription: "",
				AllDescription:   "",
				Category:         "",
				Price:            0,
				NameSpecialist:   "",
				Experience:       0,
				Phone:            "",
				Email: "",
				Location:      "",
				GenerateImage: true,
			},
			expErr: ErrEmptyField,
		},
	}
	for _, tCase := range cases {
		t.Run(tCase.name, func(t *testing.T) {
			err := tCase.in.Validate()
			require.EqualError(t, ErrEmptyField, err.Error())	
		})
	}
}