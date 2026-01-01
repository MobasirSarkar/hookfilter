package jsonfilter

import (
	"errors"
	"fmt"

	"github.com/itchyny/gojq"
)

var (
	ErrEmptyOutput = errors.New("filter produced no output")
)

// Transform executes a jq filter string against a Go object (map/slice)
// It returns the first result found
func Transform(input any, filterStr string) (any, error) {

	// fast path: If filter is empty or just a dot return input as-is
	if filterStr == "" || filterStr == "." {
		return input, nil
	}

	//parse the jq query
	query, err := gojq.Parse(filterStr)
	if err != nil {
		return nil, fmt.Errorf("invalid jq syntax: %w", err)
	}

	// gojq works on standard map[string]any types, which matches
	// what encoding/json unmarshals into.
	iter := query.Run(input)

	// we only take the first emitted value
	// (Webhooks are typically 1 request -> 1 transformed request)
	v, ok := iter.Next()
	if !ok {
		return nil, ErrEmptyOutput
	}

	// check for execution errors.
	if err, ok := v.(error); ok {
		return nil, fmt.Errorf("jq execution error: %w", err)
	}

	return v, nil
}
