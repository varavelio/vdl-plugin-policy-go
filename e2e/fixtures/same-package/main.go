package main

import (
	"fmt"
	"os"

	"example.com/same-package/gen"
)

func main() {
	if !gen.VDLPolicies.CanReadDoc.Check(gen.User{Id: "u1"}, gen.Doc{OwnerId: "u1"}) {
		fmt.Println("expected owner to pass")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanReadDoc.Check(gen.User{Id: "u9", Role: "admin"}, gen.Doc{OwnerId: "u1"}) {
		fmt.Println("expected admin to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanReadDoc.Check(gen.User{Id: "u9"}, gen.Doc{OwnerId: "u1"}) {
		fmt.Println("expected stranger to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
