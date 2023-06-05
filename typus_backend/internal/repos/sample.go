package repos

import (
	"backend/internal/errors"
	"backend/internal/models"
	"backend/pkg/store"
	"database/sql"
	"fmt"
	"log"

	"github.com/lib/pq"
)

// Default representation of the sample repository.
// Contains the store in order to query the database.
type SampleRepo struct {
	store *store.Store
}

// Create a new SampleRepo.
func NewSampleRepo() (repo *SampleRepo, err error) {
	sConf := store.NewConfig()
	s := store.New(sConf)

	if err = s.Open(); err != nil {
		log.Fatal("Could not create SampleRepo")
	}

	repo = &SampleRepo{store: s}
	return
}

// Get a list of all samples.
func (r *SampleRepo) GetList() (samples []*models.Sample, err error) {

	// Construct query and query the database

	query := `
		SELECT id, title, content, language, difficulty, completed_cnt
		FROM code_samples;`

	rows, err := r.store.DB.Query(query)

	if err != nil {
		err = errors.ErrServerError
		return
	}
	defer rows.Close()

	// Get every row and fill the array

	for rows.Next() {
		var sample models.Sample

		if err = rows.Scan(&sample.ID, &sample.Title, pq.Array(&sample.Content), &sample.Language, &sample.Difficulty, &sample.CompletedCnt); err != nil {
			err = errors.ErrServerError
			return
		}

		samples = append(samples, &sample)
	}
	return
}

// Get sample instance with the provided id.
func (r *SampleRepo) GetInstanceById(id int) (sample *models.Sample, err error) {

	// Construct the query and query the database
	query := `
		SELECT id, title, content, language, difficulty, completed_cnt
		FROM code_samples 

		WHERE id=$1;`
	sample = &models.Sample{}

	err = r.store.DB.
		QueryRow(query, id).
		Scan(&sample.ID, &sample.Title, pq.Array(&sample.Content), &sample.Language, &sample.Difficulty, &sample.CompletedCnt)

	// Check for errors and return if everything's fine
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.ErrNoSampleWithId
			return
		}
		err = errors.ErrServerError
		return
	}
	return
}

// Create a new sample instance with the provided data.
func (r *SampleRepo) CreateInstance(sampleReceived *models.Sample) (sampleReturned *models.Sample, err error) {

	// Construct the query and query the database

	query := `
		INSERT INTO code_samples (title, content, language, difficulty, completed_cnt) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, title, content, language, difficulty, completed_cnt;`
	sampleReturned = &models.Sample{}

	// Get the created sample and check for errors
	err = r.store.DB.
		QueryRow(query, sampleReceived.Title, pq.Array(sampleReceived.Content), sampleReceived.Language, sampleReceived.Difficulty, sampleReceived.CompletedCnt).
		Scan(&sampleReturned.ID, &sampleReturned.Title, pq.Array(&sampleReturned.Content), &sampleReturned.Language, &sampleReturned.Difficulty, &sampleReturned.CompletedCnt)

	if err != nil {
		fmt.Println(err)
		err = errors.ErrServerError
	}
	return
}
