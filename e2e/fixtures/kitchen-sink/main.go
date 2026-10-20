package main

import (
	"fmt"
	"os"
	"time"

	"example.com/kitchen-sink/gen"
	"example.com/kitchen-sink/types"
)

func passing(now time.Time) (types.Employee, types.Document, types.Request) {
	return types.Employee{
			Id:         "u1",
			Role:       "editor",
			Level:      3,
			Rating:     4.7,
			Active:     true,
			Department: types.Ptr("Finance"),
			Clearance:  types.ClearanceHigh,
		}, types.Document{
			OwnerId:     "u1",
			Status:      types.DocStatusPublished,
			Sensitivity: 3,
			Score:       8.0,
			Title:       "Report",
			PublishedAt: now.Add(-time.Hour),
			ExpiresAt:   types.Ptr(now.Add(time.Hour)),
		}, types.Request{
			Now:         now,
			MfaVerified: true,
			Ip:          "1.2.3.4",
		}
}

func main() {
	now := time.Now()
	p, r, c := passing(now)
	if !gen.CanReadDocument(p, r, c) {
		fmt.Println("expected full pass to allow")
		os.Exit(1)
	}
	if !gen.VDLPolicies.CanReadDocument.Check(p, r, c) {
		fmt.Println("expected catalog check to allow")
		os.Exit(1)
	}

	archived := r
	archived.Status = types.DocStatusArchived
	if gen.CanReadDocument(p, archived, c) {
		fmt.Println("expected archived deny to win")
		os.Exit(1)
	}

	inactive := p
	inactive.Active = false
	if gen.CanReadDocument(inactive, r, c) {
		fmt.Println("expected inactive deny to win")
		os.Exit(1)
	}

	blocked := p
	blocked.Team = types.Ptr("Blocked")
	if gen.CanReadDocument(blocked, r, c) {
		fmt.Println("expected blocked team deny to win")
		os.Exit(1)
	}

	stranger := types.Employee{
		Id:        "u9",
		Role:      "viewer",
		Level:     3,
		Rating:    4.7,
		Active:    true,
		Clearance: types.ClearanceHigh,
	}
	strangerDoc := r
	strangerDoc.OwnerId = "u1"
	if gen.CanReadDocument(stranger, strangerDoc, c) {
		fmt.Println("expected stranger without access to fail")
		os.Exit(1)
	}

	expired := r
	expired.ExpiresAt = types.Ptr(now.Add(-time.Hour))
	if gen.CanReadDocument(p, expired, c) {
		fmt.Println("expected expired document to fail")
		os.Exit(1)
	}

	noMfa := c
	noMfa.MfaVerified = false
	if gen.CanReadDocument(p, r, noMfa) {
		fmt.Println("expected missing mfa to fail")
		os.Exit(1)
	}
	fmt.Println("ok")
}
