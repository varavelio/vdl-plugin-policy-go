package main

import (
	"fmt"
	"os"
	"time"

	"example.com/datetime/gen"
	"example.com/datetime/types"
)

func main() {
	now := time.Now()
	future := types.Event{At: now.Add(time.Hour)}
	past := types.Event{At: now.Add(-time.Hour)}
	ctx := types.Ctx{Now: now}
	if !gen.VDLPolicies.CanAttend.Check(future, future, ctx) {
		fmt.Println("expected future event to pass")
		os.Exit(1)
	}
	if gen.VDLPolicies.CanAttend.Check(past, past, ctx) {
		fmt.Println("expected past event to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
