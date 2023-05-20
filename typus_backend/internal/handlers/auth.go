package handlers

import (
	"backend/internal/errors"
	"backend/internal/models"
	"backend/internal/usecases"
	"backend/pkg/headers"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Auth API endpotins handler.
// Stores its usecase and implements Handler interface.
type AuthHandler struct {
	UseCase *usecases.AuthUsecase
}

// Create a new AuthHandler.
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		UseCase: usecases.NewAuthUsecase(),
	}
}

// Add all the auth API endpoints.
func (h *AuthHandler) Routes(g *gin.RouterGroup) {
	g.POST("/register/", h.handleRegister)
	g.POST("/login/", h.handleLogin)

	g.OPTIONS("/register/", handleOptions)
	g.OPTIONS("/login/", handleOptions)
}

// Handler for the /api/auth/register/ API endpoint.
func (h *AuthHandler) handleRegister(ctx *gin.Context) {

	headers.DefaultHeaders(ctx, "POST")

	var regBody models.RegisterCredentials

	// Read the request's body
	if err := ctx.BindJSON(&regBody); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Could not decode the request",
		})
		fmt.Println(err.Error())
		return
	}

	// Check if all the necessary data was provided

	if regBody.Email == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Email was not provided",
		})
		return
	}
	if regBody.Username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Username was not provided",
		})
		return
	}
	if regBody.Password == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Password was not provided",
		})
		return
	}

	// Call the usecase

	id, err := h.UseCase.RegisterUser(regBody)

	if err != nil {
		switch err {
		case errors.ErrNonUniqueUsername:
			{
				ctx.JSON(http.StatusConflict, gin.H{
					"Error": "User with the same username already exists",
				})
				return
			}
		case errors.ErrNonUniqueEmail:
			{
				ctx.JSON(http.StatusConflict, gin.H{
					"Error": "User with the same email already exists",
				})
				return
			}
		default:
			{
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"Error": "Server error",
				})
				return
			}
		}
	}

	// Return id of the created user

	ctx.JSON(http.StatusCreated, gin.H{
		"id": id,
	})
}

// Handler for the /api/auth/login/ API endpoint.
func (h *AuthHandler) handleLogin(ctx *gin.Context) {

	headers.DefaultHeaders(ctx, "POST")

	var logBody models.LoginCredentials

	// Read the request's body
	if err := ctx.BindJSON(&logBody); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Could not decode the request",
		})
		return
	}

	// Check if all the necessary data was provided

	if logBody.Email == "" && logBody.Username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Email or username was not provided",
		})
		return
	}
	if logBody.Password == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"Error": "Password was not provided",
		})
		return
	}

	// Call the usecase

	token, err := h.UseCase.LoginUser(logBody)

	if err != nil {
		switch err {
		case errors.ErrNoUserWithUsername:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{
					"Error": "No user with such username",
				})
				return
			}
		case errors.ErrNoUserWithEmail:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{
					"Error": "No user with such email",
				})
				return
			}
		case errors.ErrInvalidCredentials:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{
					"Error": "Wrong password provided",
				})
				return
			}
		default:
			{
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"Error": "Server error",
				})
				return
			}
		}
		return
	}

	// Return id of the created user

	ctx.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}
