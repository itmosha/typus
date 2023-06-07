package models

// User profile representation.
type Profile struct {
	UserID              int
	SamplesCompletedCnt int
	TotalCompletedCnt   int
	CreatedDate         string
}
