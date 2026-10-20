package main

import (
	"fmt"
	"os"

	"example.com/context-only/gen"
	"example.com/context-only/types"
)

func main() {
	ok := types.SessionContext{TenantId: "acme"}
	if !gen.CanAccessTenant(types.User{Id: "u1"}, ok) {
		fmt.Println("expected tenant member to pass")
		os.Exit(1)
	}
	if gen.CanAccessTenant(types.User{Id: "u1"}, types.SessionContext{TenantId: "other"}) {
		fmt.Println("expected other tenant to fail")
		os.Exit(1)
	}
	if gen.CanAccessTenant(types.User{}, ok) {
		fmt.Println("expected empty id to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
