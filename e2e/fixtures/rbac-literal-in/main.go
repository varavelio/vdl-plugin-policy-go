package main

import (
	"fmt"
	"os"

	"example.com/rbac-literal-in/gen"
	"example.com/rbac-literal-in/types"
)

func main() {
	if !gen.CanManage(types.User{Role: "admin"}) || !gen.CanManage(types.User{Role: "owner"}) {
		fmt.Println("expected admin and owner to pass")
		os.Exit(1)
	}
	if gen.CanManage(types.User{Role: "viewer"}) {
		fmt.Println("expected viewer to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
