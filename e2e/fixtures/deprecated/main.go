package main

import (
	"fmt"
	"os"

	"example.com/deprecated/gen"
	"example.com/deprecated/types"
)

func main() {
	if !gen.VDLPolicies.CanOld.Check(types.User{Id: "u1"}) {
		fmt.Println("expected deprecated policy to still pass")
		os.Exit(1)
	}
	fmt.Println("ok")
}
