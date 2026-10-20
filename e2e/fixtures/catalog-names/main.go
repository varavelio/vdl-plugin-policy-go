package main

import (
	"fmt"
	"os"

	"example.com/catalog-names/gen"
	"example.com/catalog-names/types"
)

func main() {
	names := gen.VDLPolicies.Names()
	if len(names) != 3 || names[0] != "CanApple" || names[1] != "CanMiddle" || names[2] != "CanZebra" {
		fmt.Printf("expected sorted names, got %v\n", names)
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanZebra.Check(types.User{}) {
		fmt.Println("expected zebra to pass")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanApple.Check(types.User{Role: "admin"}) {
		fmt.Println("expected apple admin to pass")
		os.Exit(1)
	}
	fmt.Println("ok")
}
