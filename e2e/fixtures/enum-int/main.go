package main

import (
	"fmt"
	"os"

	"example.com/enum-int/gen"
	"example.com/enum-int/types"
)

func main() {
	if !gen.CanExpedite(types.User{Id: "u1"}, types.Ticket{Priority: types.PriorityHigh}) {
		fmt.Println("expected high priority to pass")
		os.Exit(1)
	}
	if gen.CanExpedite(types.User{Id: "u1"}, types.Ticket{Priority: types.PriorityLow}) {
		fmt.Println("expected low priority to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
