package main

import (
	"fmt"
	"os"

	"example.com/enum-string/gen"
	"example.com/enum-string/types"
)

func main() {
	if !gen.VDLPolicies.CanPayInvoice.Check(types.User{Id: "u1"}, types.Invoice{Status: types.InvoiceStatusUnlocked}) {
		fmt.Println("expected unlocked to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanPayInvoice.Check(types.User{Id: "u1"}, types.Invoice{Status: types.InvoiceStatusLocked}) {
		fmt.Println("expected locked to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
