package ui

import (
	"net/http"
	"strings"
	"shift-management/util"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ""
		
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		} else {
			// Fallback to query parameter (e.g. for downloads)
			tokenString = c.Query("token")
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header or token parameter required"})
			c.Abort()
			return
		}
		
		claims, err := util.ParseJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}
		
		c.Set("userID", claims["sub"])
		c.Set("role", claims["role"])
		c.Next()
	}
}
