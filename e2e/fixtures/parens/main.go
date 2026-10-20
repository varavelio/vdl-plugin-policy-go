package main

import (
	"fmt"
	"os"

	"example.com/parens/gen"
	"example.com/parens/types"
)

func main() {
	admin := types.User{Id: "u1", Role: "admin", Level: 5, Department: types.Ptr("Finance")}
	pub := types.Doc{Status: types.DocStatusPublished, AllowedIds: []string{"u1"}}
	if !gen.VDLPolicies.CanOpenDoc.Check(admin, pub) {
		fmt.Println("expected admin with finance and access to pass")
		os.Exit(1)
	}

	// Group 1 fails: viewer is neither admin nor owner.
	if gen.VDLPolicies.CanOpenDoc.Check(types.User{Id: "u1", Role: "viewer", Level: 5, Department: types.Ptr("Finance")}, pub) {
		fmt.Println("expected viewer to fail group 1")
		os.Exit(1)
	}

	// Group 2 fails: draft is neither published nor review.
	draft := types.Doc{Status: types.DocStatusDraft, AllowedIds: []string{"u1"}}
	if gen.VDLPolicies.CanOpenDoc.Check(admin, draft) {
		fmt.Println("expected draft to fail group 2")
		os.Exit(1)
	}

	// Group 3 passes through the level escape hatch without a department.
	senior := types.User{Id: "u1", Role: "owner", Level: 9001}
	if !gen.VDLPolicies.CanOpenDoc.Check(senior, types.Doc{Status: types.DocStatusReview, AllowedIds: []string{"u1"}}) {
		fmt.Println("expected senior level to pass group 3")
		os.Exit(1)
	}

	// Group 3 fails: known non-matching department and low level.
	sales := types.User{Id: "u1", Role: "admin", Level: 1, Department: types.Ptr("Sales")}
	if gen.VDLPolicies.CanOpenDoc.Check(sales, pub) {
		fmt.Println("expected sales with low level to fail group 3")
		os.Exit(1)
	}

	// Group 4 passes through the negated archived flag without list access.
	fresh := types.Doc{Status: types.DocStatusPublished}
	if !gen.VDLPolicies.CanOpenDoc.Check(admin, fresh) {
		fmt.Println("expected fresh doc to pass group 4")
		os.Exit(1)
	}

	// Group 4 fails: missing from the list and archived.
	stale := types.Doc{Status: types.DocStatusPublished, AllowedIds: []string{"u9"}, Archived: true}
	if gen.VDLPolicies.CanOpenDoc.Check(types.User{Id: "u1", Role: "admin", Level: 5, Department: types.Ptr("Finance")}, stale) {
		fmt.Println("expected archived doc without access to fail group 4")
		os.Exit(1)
	}

	// Group 5 fails: low level and plain role.
	junior := types.User{Id: "u1", Role: "admin", Level: 1, Department: types.Ptr("Finance")}
	if gen.VDLPolicies.CanOpenDoc.Check(junior, pub) {
		fmt.Println("expected junior admin to fail group 5")
		os.Exit(1)
	}

	// Deny wins over an otherwise passing check.
	banned := admin
	banned.Banned = true
	if gen.VDLPolicies.CanOpenDoc.Check(banned, pub) {
		fmt.Println("expected banned deny to win")
		os.Exit(1)
	}
	fmt.Println("ok")
}
