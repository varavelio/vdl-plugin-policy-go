package main

import (
	"fmt"
	"os"

	"example.com/context-mfa/gen"
	"example.com/context-mfa/types"
)

func main() {
	owner := types.User{Id: "u1"}
	inv := types.Invoice{OwnerId: "u1"}
	mfa := types.SessionContext{MfaVerified: true}
	noMfa := types.SessionContext{}
	if !gen.CanApproveInvoice(owner, inv, mfa) {
		fmt.Println("expected owner with mfa to pass")
		os.Exit(1)
	}
	if gen.CanApproveInvoice(owner, inv, noMfa) {
		fmt.Println("expected missing mfa to fail")
		os.Exit(1)
	}
	if gen.CanApproveInvoice(types.User{Id: "u1", Disabled: true}, inv, mfa) {
		fmt.Println("expected deny to win over allow")
		os.Exit(1)
	}
	if gen.CanApproveInvoice(types.User{Id: "u2"}, inv, mfa) {
		fmt.Println("expected non-owner to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
