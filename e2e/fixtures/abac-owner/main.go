package main

import (
	"fmt"
	"os"

	"example.com/abac-owner/gen"
	"example.com/abac-owner/types"
)

func main() {
	if !gen.CanReadInvoice(types.User{Id: "u1"}, types.Invoice{OwnerId: "u1"}) {
		fmt.Println("expected owner to pass")
		os.Exit(1)
	}
	if gen.CanReadInvoice(types.User{Id: "u1"}, types.Invoice{OwnerId: "u2"}) {
		fmt.Println("expected non-owner to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
