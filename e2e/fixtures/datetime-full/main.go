package main

import (
	"fmt"
	"os"
	"time"

	"example.com/datetime-full/gen"
	"example.com/datetime-full/types"
)

func main() {
	now := time.Now()
	w := types.Window{Start: now.Add(-time.Hour), End: now.Add(time.Hour)}
	if !gen.IsActive(w, w, types.Ctx{Now: now}) {
		fmt.Println("expected active window to pass")
		os.Exit(1)
	}
	past := types.Window{Start: now.Add(-3 * time.Hour), End: now.Add(-time.Hour)}
	if gen.IsActive(past, past, types.Ctx{Now: now}) {
		fmt.Println("expected past window to fail")
		os.Exit(1)
	}
	instant := types.Window{Start: now, End: now}
	if !gen.IsInstant(instant, instant) {
		fmt.Println("expected instant window to pass")
		os.Exit(1)
	}
	if gen.IsInstant(w, w) {
		fmt.Println("expected ranged window to fail instant check")
		os.Exit(1)
	}
	if len(gen.VDLPolicies.Names()) != 2 {
		fmt.Println("expected two policies")
		os.Exit(1)
	}
	fmt.Println("ok")
}
