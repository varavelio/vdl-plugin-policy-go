package main

import (
	"fmt"
	"os"

	"example.com/enum-advanced/gen"
	"example.com/enum-advanced/types"
)

func main() {
	direct := types.Invoice{OwnerRole: types.RoleAdmin}
	if !gen.CanAct(types.User{Role: types.RoleAdmin}, direct) {
		fmt.Println("expected enum direct match to pass")
		os.Exit(1)
	}
	viaList := types.Invoice{OwnerRole: types.RoleAdmin, AllowedRoles: []types.Role{types.RoleOwner}}
	if !gen.CanAct(types.User{Role: types.RoleOwner}, viaList) {
		fmt.Println("expected enum ref list to pass")
		os.Exit(1)
	}
	viaLiteral := types.Invoice{OwnerRole: types.RoleAdmin}
	if !gen.CanAct(types.User{Role: types.RoleOwner}, viaLiteral) {
		fmt.Println("expected enum literal list to pass")
		os.Exit(1)
	}
	if gen.CanAct(types.User{Role: types.RoleViewer}, viaLiteral) {
		fmt.Println("expected viewer to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
