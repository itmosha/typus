package errors

import "errors"

// All the errors used for communications between repos, usecases and handlers.
var (
	ErrNonUniqueEmail    = errors.New("non unique email")
	ErrNonUniqueUsername = errors.New("non unique username")

	ErrNoUserWithId       = errors.New("no user with such id")
	ErrNoUserWithEmail    = errors.New("no user with such email")
	ErrNoUserWithUsername = errors.New("no user with such username")

	ErrNoSampleWithId = errors.New("no sample with such id")

	ErrInvalidCredentials = errors.New("invalid credentials provided")

	ErrJwtSigningFailed             = errors.New("could not sign the JWT token")
	ErrJwtParsingFailed             = errors.New("failed to parse the JWT token")
	ErrClaimExpAssertionFailed      = errors.New("type assertion for exp claim failed")
	ErrClaimUsernameAssertionFailed = errors.New("type assertion for username claim failed")
	ErrClaimEmailAssertionFailed    = errors.New("type assertion for email claim failed")
	ErrClaimRoleAssertionFailed     = errors.New("type assertion for role claim failed")
	ErrAccessTokenExpired           = errors.New("access token is expired")
	ErrRefreshTokenExpired          = errors.New("refresh token is expired")

	ErrServerError = errors.New("server error")
)
