package main

import (
	"fmt"
	"os"
	"reflect"

	"example.com/many-policies/gen"
	"example.com/many-policies/types"
)

func main() {
	want := []string{
		"CanApple", "CanBanana", "CanCherry", "CanDate",
		"CanFig", "CanGrape", "CanKiwi", "CanLemon",
		"CanMango", "CanMelon", "CanOrange", "CanZebra",
	}
	names := gen.VDLPolicies.Names()
	if !reflect.DeepEqual(names, want) {
		fmt.Printf("expected sorted names %v, got %v\n", want, names)
		os.Exit(1)
	}

	admin := types.User{Id: "u1", Role: "admin", Level: 3}
	if !gen.VDLPolicies.CanApple.Check(admin) {
		fmt.Println("expected CanApple admin to pass")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanMango.Check(admin, types.Doc{OwnerId: "u1"}) {
		fmt.Println("expected CanMango owner to pass")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanBanana.Check(admin, types.Ctx{MinLevel: 2}) {
		fmt.Println("expected CanBanana level to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanDate.Check(types.User{Role: "banned", Level: 3}) {
		fmt.Println("expected CanDate deny to win")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanZebra.Check(types.User{}) {
		fmt.Println("expected CanZebra to pass")
		os.Exit(1)
	}
	fmt.Println("ok")
}
