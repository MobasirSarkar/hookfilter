package jsonfilter

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestTransform(t *testing.T) {
	// Define a sample JSON payload (simulating a GitHub webhook)
	rawJSON := `
	{
		"action": "opened",
		"issue": {
			"id": 123,
			"title": "Fix the bug",
			"user": {
				"login": "octocat"
			}
		}
	}`

	var input any
	if err := json.Unmarshal([]byte(rawJSON), &input); err != nil {
		t.Fatalf("Failed to parse test json: %v", err)
	}

	tests := []struct {
		name      string
		filter    string
		want      any // We'll assume json unmarshal types (float64 for numbers)
		expectErr bool
	}{
		{
			name:   "Pass through (dot)",
			filter: ".",
			want:   input,
		},
		{
			name:   "Extract specific field",
			filter: ".action",
			want:   "opened",
		},
		{
			name:   "Deep extraction",
			filter: ".issue.user.login",
			want:   "octocat",
		},
		{
			name:   "Construct new object",
			filter: "{ event: .action, author: .issue.user.login }",
			want: map[string]any{
				"event":  "opened",
				"author": "octocat",
			},
		},
		{
			name:   "Math operation",
			filter: ".issue.id + 100",
			want:   223.0, // JSON numbers are float64 in Go
		},
		{
			name:      "Invalid Syntax",
			filter:    ".....",
			expectErr: true,
		},
		{
			name:      "Filter out (Empty result)",
			filter:    "select(.action == 'closed')",
			expectErr: true, // Should return ErrEmptyOutput
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Transform(input, tt.filter)

			if tt.expectErr {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			// DeepEqual is needed to compare maps and slices
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Transform() = %v, want %v", got, tt.want)
			}
		})
	}
}
