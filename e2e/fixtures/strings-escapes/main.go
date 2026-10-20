package main

import (
	"fmt"
	"os"

	"example.com/strings-escapes/gen"
	"example.com/strings-escapes/types"
)

func main() {
	if !gen.CanGreet(types.User{Nickname: "O'Neil"}) {
		fmt.Println("expected escaped quote to pass")
		os.Exit(1)
	}
	if !gen.CanGreet(types.User{Code: `a\b`}) {
		fmt.Println("expected escaped backslash to pass")
		os.Exit(1)
	}
	if gen.CanGreet(types.User{Nickname: "Other", Code: "other"}) {
		fmt.Println("expected other values to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
