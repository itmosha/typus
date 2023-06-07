package repos

import (
	"backend/internal/errors"
	"backend/internal/models"
	"backend/pkg/store"
	"database/sql"
	"log"
)

// Default representation of the profile repository.
// Contains the store in order to query the database.
type ProfileRepo struct {
	store *store.Store
}

// Create a new ProfileRepo.
func NewProfileRepo() (repo *ProfileRepo, err error) {
	sConf := store.NewConfig()
	s := store.New(sConf)

	if err = s.Open(); err != nil {
		log.Fatal("Could not create ProfileRepo")
	}

	repo := &ProfileRepo{store: s}
	return
}

// Create Profile in the database using provided userID.
func (r *ProfileRepo) CreateInstanceWithUserID(userID int) (profile *models.Profile, err error) {

	// Construct the query
	query := `
		INSERT INTO profiles (user_id, samples_completed_cnt, total_completed_cnt)
		VALUES ($1, $2, $3)
		RETURNING user_id, samples_completed_cnt, total_completed_cnt, created_date;`

	// Prepare an empty profile for scanning and get current date
	profile = &models.Profile{}

	// Query the database and get the created Profile
	err = r.store.DB.
		QueryRow(query, userId, 0, 0).
		Scan(&profile.UserID, &profile.SamplesCompletedCnt, &profile.TotalCompletedCnt, &Profile.CreatedDate)

	// Check for errors and return
	if err != nil {
		err = errors.ErrServerError
	}
	return
}

// Get Profile from the database using provided userID.
func (r *ProfileRepo) GetInstanceByUserID(userID int) (profile *models.Profile, err error) {

	// Construct the query
	query := `
		SELECT user_id, samples_completed_cnt, total_completed_cnt, created_date
		FROM profiles
		WHERE user_id=$1;`

	// Prepare an empty profile for scanning
	profile = &models.Profile{}

	// Query the database and get the created Profile
	err = r.store.DB.
		QueryRow(query, userID).
		Scan(&profile.UserID, &profile.SamplesCompletedCnt, &profile.TotalCompletedCnt, &Profile.CreatedDate)

	// Check for errors and return
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.ErrNoUserWithEmail
			return
		}
		err = errors.ErrServerError
	}
	return
}
