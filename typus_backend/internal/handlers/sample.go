package handlers

import (
	"backend/internal/errors"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/usecases"
	"backend/pkg/headers"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Default representation of the sample repository.
// Contains the store in order to query the database.
type SampleHandler struct {
	UseCase *usecases.SampleUsecase
}

// Create a new SampleHandler.
func NewSampleHandler() *SampleHandler {
	return &SampleHandler{
		UseCase: usecases.NewSampleUsecase(),
	}
}

// Add all the auth API endpoints.
func (h *SampleHandler) Routes(g *gin.RouterGroup) {
	g.GET("", h.handleSamplesList)
	g.GET("/:sampleId", h.handleGetSample)
	g.POST("", middleware.IsAuth(), middleware.IsModerator(), h.handleCreateSample)

	g.OPTIONS("", handleOptions)
	g.OPTIONS("/:sampleId", handleOptions)
}

// Handler for the /api/samples API GET endpoint.
// GUEST (0) access level.
func (h *SampleHandler) handleSamplesList(ctx *gin.Context) {

	headers.DefaultHeaders(ctx, "GET")

	// Access level: 0 (guest)
	// No need to check the JWT in this handler

	samples, err := h.UseCase.GetAllSamples()

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"Error": "Server error",
		})
		return
	}

	ctx.JSON(http.StatusOK, samples)
}

// Handler for the /api/samples/:sampleId GET API endpoint.
// GUEST (0) access level.
func (h *SampleHandler) handleGetSample(ctx *gin.Context) {

	headers.DefaultHeaders(ctx, "GET")

	// Access level: 0 (guest)
	// No need to check the JWT in this handler

	sampleIdString := ctx.Param("sampleId")
	sampleId, err := strconv.Atoi(sampleIdString)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"Error": err.Error(),
		})
		return
	}

	sample, err := h.UseCase.GetSampleById(sampleId)

	if err != nil {
		switch err {
		case errors.ErrNoSampleWithId:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{
					"Error": "No sample with such id",
				})
				return
			}
		default:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{
					"Error": "Server error",
				})
				return
			}
		}
	}

	ctx.JSON(http.StatusOK, sample)
}

// Handler for the /api/samples/ POST API endpoint.
// MODERATOR (2) access level
func (h *SampleHandler) handleCreateSample(ctx *gin.Context) {

	headers.DefaultHeaders(ctx, "POST")

	var regBody models.CreateSampleBody

	// Read the request's body

	if err := ctx.BindJSON(&regBody); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"Error": "Could not decode the request",
		})
		return
	}

	// Check for all necessary fields

	if regBody.Title == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Sample title was not provided",
		})
		return
	}
	if regBody.Content == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Sample content was not provided",
		})
		return
	}
	if regBody.Language == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Sample language was not provided",
		})
		return
	}

	sample := &models.Sample{
		Title:    regBody.Title,
		Content:  regBody.Content,
		Language: regBody.Language,
	}

	sample, err := h.UseCase.CreateSample(sample)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"Error": "Server error",
		})
		return
	}

	ctx.JSON(http.StatusCreated, sample)
}
