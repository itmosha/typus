package middleware

import (
	"backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HasRole(requredRole models.ROLE) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, _ := c.Get("token")

		k := token.(*jwt_funcs.JWTClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Invalid access token provided"})
			return
		}

		if t.Role < requiredRole {
			c.AbortWithStatusJSON(http.StatusForbidden, map[string]string{"message": "You do not have access to this data"})
			return
		}
		c.Next()
	}
}
