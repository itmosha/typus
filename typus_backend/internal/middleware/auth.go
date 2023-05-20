package middleware

import (
	"backend/internal/errors"
	"backend/pkg/jwt_funcs"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Middleware for checking user's authentication
func IsAuth() gin.HandlerFunc {
	return func(c *gin.Context) {

		// Get header with the access token
		authHeader := c.Request.Header["Authorization"]
		if len(authHeader) < 1 {
			c.AbortWithStatusJSON(http.StatusBadRequest, map[string]string{"message": "Access token was not provided"})
			return
		}

		// Check if access token was provided
		headerToken := authHeader[0]
		splitToken := strings.Split(headerToken, " ")
		if len(splitToken) < 2 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Invalid access token provided"})
			return
		}
		token := splitToken[1]

		// Validate the access token and check for errors
		err := jwt_funcs.ValidateAccessToken(token)
		if err != nil {
			switch err {
			case errors.ErrAccessTokenExpired:
				{
					c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Access token is expired"})
					return
				}
			case errors.ErrJwtParsingFailed:
				{
					c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Invalid access token provided"})
					return
				}
			case errors.ErrClaimExpAssertionFailed:
				{
					c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Exp claim of access token didn't pass type assertion"})
					return
				}
			case errors.ErrClaimUsernameAssertionFailed:
				{
					c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Username claim of access token didn't pass type assertion"})
					return
				}
			case errors.ErrClaimEmailAssertionFailed:
				{
					c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Email claim of access token didn't pass type assertion"})
					return
				}
			case errors.ErrClaimRoleAssertionFailed:
				{
					c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Role claim of access token didn't pass type assertion"})
					return
				}
			default:
				{
					c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"message": "Server error"})
					return
				}
			}
		}

		// Extract the access token claims and set the context variable
		claims, _, _ := jwt_funcs.ExtractAccessTokenClaims(token)
		c.Set("token", claims)
		c.Next()
	}
}
