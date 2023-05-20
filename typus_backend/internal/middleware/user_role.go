package middleware

import (
	"backend/internal/models"
	"backend/pkg/jwt_funcs"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Check if a user is at least registered.
func IsUser() gin.HandlerFunc {
	return HasRole(models.USER)
}

// Check if a user is at least a moderator.
func IsModerator() gin.HandlerFunc {
	return HasRole(models.MODERATOR)
}

// Check if a user is admin.
func IsAdmin() gin.HandlerFunc {
	return HasRole(models.ADMIN)
}

// Check if a user has a certain role.
func HasRole(requiredRole models.ROLE) gin.HandlerFunc {
	return func(c *gin.Context) {

		// Get token from gin's context
		token, _ := c.Get("token")

		t, ok := token.(*jwt_funcs.AccessTokenClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Invalid access token provided"})
			return
		}

		// Check if user has the role
		if t.Role < requiredRole {
			c.AbortWithStatusJSON(http.StatusForbidden, map[string]string{"message": "You do not have access to this data"})
			return
		}
		c.Next()
	}
}
