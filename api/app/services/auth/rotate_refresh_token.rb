module Auth
  # Exchanges a refresh token for a new pair. Reusing an already-rotated token revokes the whole family.
  class RotateRefreshToken
    class Invalid < StandardError; end

    def self.call(raw, user_agent: nil)
      token = RefreshToken.find_by(token_digest: RefreshToken.digest(raw.to_s))
      raise Invalid unless token

      reused = false
      token.with_lock do
        if token.revoked?
          reused = true
        else
          raise Invalid if token.expired?

          token.revoke!
        end
      end
      # Revoke outside the lock's transaction so raising does not roll it back.
      if reused
        token.user.refresh_tokens.active.update_all(revoked_at: Time.current)
        raise Invalid
      end
      [ token.user, IssueTokens.call(token.user, user_agent: user_agent) ]
    end
  end
end
