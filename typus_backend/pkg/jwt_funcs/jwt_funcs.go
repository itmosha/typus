package jwt_funcs

import (
	"backend/internal/errors"
	"backend/internal/models"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

// Default token pair used to authenticate and authorize users.
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// Access token claims definition.
type AccessTokenClaims struct {
	Exp      int64
	Username string
	Email    string
	Role     models.ROLE
}

// Refresh token claims definition.
type RefreshTokenClaims struct {
	Exp int64
}

// Generate a new TokenPair based on user's username, email and role.
// Access token has 1 hour expiry, refresh token has 24 hours expiry.
func GenerateTokenPair(claims *AccessTokenClaims) (tokenPair *TokenPair, err error) {

	// Create an access token with provided claims and 1 hour expiry
	aToken := jwt.New(jwt.SigningMethodHS256)
	aClaims := aToken.Claims.(jwt.MapClaims)

	aClaims["exp"] = time.Now().Add(time.Hour).Unix()
	aClaims["username"] = claims.Username
	aClaims["email"] = claims.Email
	aClaims["role"] = claims.Role

	// Get secret key from .env
	secretKey := os.Getenv("JWT_KEY")
	if secretKey == "" {
		log.Fatal("Variable JWT_KEY not found in .env file")
	}

	at, err := aToken.SignedString([]byte(secretKey))

	if err != nil {
		err = errors.ErrJwtSigningFailed
		return
	}

	// Create a refresh token with 24 hour expiry
	rToken := jwt.New(jwt.SigningMethodHS256)
	rClaims := rToken.Claims.(jwt.MapClaims)

	rClaims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	rt, err := rToken.SignedString([]byte(secretKey))

	if err != nil {
		err = errors.ErrJwtSigningFailed
		return
	}

	// Construct and return a token pair
	tokenPair = &TokenPair{
		AccessToken:  at,
		RefreshToken: rt,
	}
	return
}

// Extract the payload from access token and return the claims.
func ExtractAccessTokenClaims(at string) (claims *AccessTokenClaims, isExpired bool, err error) {

	// Get secret key from .env
	secretKey := os.Getenv("JWT_KEY")
	if secretKey == "" {
		log.Fatal("Variable JWT_KEY not found in .env file")
	}

	accessClaims := jwt.MapClaims{}

	// Parse the claims and check for token expiry
	_, err = jwt.ParseWithClaims(at, accessClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		if err.Error() == "Token is expired" {
			isExpired = true
		} else {
			err = errors.ErrJwtParsingFailed
			return
		}
	}

	// Exctract the claims and perform type assertion
	exp, ok := accessClaims["exp"].(float64)
	if !ok {
		err = errors.ErrClaimExpAssertionFailed
		return
	}
	username, ok := accessClaims["username"].(string)
	if !ok {
		err = errors.ErrClaimUsernameAssertionFailed
		return
	}
	email, ok := accessClaims["email"].(string)
	if !ok {
		err = errors.ErrClaimEmailAssertionFailed
		return
	}
	role, ok := accessClaims["role"].(float64)
	if !ok {
		err = errors.ErrClaimRoleAssertionFailed
		return
	}

	// Construct and return AccessTokenClaims
	claims = &AccessTokenClaims{
		Exp:      int64(exp),
		Username: username,
		Email:    email,
		Role:     models.ROLE(role),
	}
	return
}

// Extract the expity from access token and return the claims.
func ExtractRefreshTokenClaims(rt string) (claims *RefreshTokenClaims, isExpired bool, err error) {

	// Get secret key from .env
	secretKey := os.Getenv("JWT_KEY")
	if secretKey == "" {
		log.Fatal("Variable JWT_KEY not found in .env file")
	}

	refreshClaims := jwt.MapClaims{}

	// Parse the claims and check for token expiry
	_, err = jwt.ParseWithClaims(rt, &refreshClaims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		if err.Error() == "Token is expired" {
			isExpired = true
		} else {
			err = errors.ErrJwtParsingFailed
			return
		}
	}

	// Exctract the claims and perform type assertion
	exp, ok := refreshClaims["exp"].(float64)
	if !ok {
		err = errors.ErrClaimExpAssertionFailed
		return
	}

	// Construct and return RefreshTokenClaims
	claims = &RefreshTokenClaims{
		Exp: int64(exp),
	}
	return
}

// Validate a token pair and check for expiry
func ValidateTokenPair(tp *TokenPair) (err error) {

	// Check the access token
	_, isExpired, err := ExtractAccessTokenClaims(tp.AccessToken)
	if err != nil {
		return
	} else if isExpired {
		err = errors.ErrAccessTokenExpired
		return
	}

	// Check the refresh token
	_, isExpired, err = ExtractRefreshTokenClaims(tp.RefreshToken)
	if err != nil {
		return
	} else if isExpired {
		err = errors.ErrRefreshTokenExpired
	}
	return
}

// Refresh a token pair. Works only on token pairs which refresh token is not expired.
func RefreshTokenPair(oldTp *TokenPair) (newTp *TokenPair, err error) {

	// Check the refresh token's expiry
	_, isExpired, err := ExtractRefreshTokenClaims(oldTp.RefreshToken)
	if err != nil {
		return
	} else if isExpired {
		err = errors.ErrRefreshTokenExpired
		return
	}

	// Get the claims from access token
	oldAClaims, _, err := ExtractAccessTokenClaims(oldTp.AccessToken)
	if err != nil {
		return
	}

	// Generate a new TokenPair and return
	newTp, err = GenerateTokenPair(oldAClaims)
	return
}
