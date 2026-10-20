package main

import (
	"fmt"
	"os"

	"example.com/has-only/gen"
	"example.com/has-only/types"
)

func main() {
	if !gen.HasDepartment(types.User{Department: types.Ptr("Finance")}) {
		fmt.Println("expected present to pass")
		os.Exit(1)
	}
	if gen.HasDepartment(types.User{}) {
		fmt.Println("expected missing to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
