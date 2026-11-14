module Auth
  # Issues a short-lived signed access token and a rotating, hashed refresh token.
  class IssueTokens
    ACCESS_TTL = 15.minutes
    REFRESH_TTL = 30.days

    Result = Struct.new(:access_token, :refresh_token, :expires_in, keyword_init: true)

    def self.verifier = Rails.application.message_verifier(:access_token)

    def self.user_id_from(token)
      verifier.verified(token, purpose: :access)
    end

    def self.call(user, user_agent: nil)
      raw = SecureRandom.urlsafe_base64(48)
      user.refresh_tokens.create!(
        token_digest: RefreshToken.digest(raw),
        expires_at: REFRESH_TTL.from_now,
        user_agent: user_agent&.truncate(255)
      )
      access = verifier.generate(user.id, purpose: :access, expires_in: ACCESS_TTL)
      Result.new(access_token: access, refresh_token: raw, expires_in: ACCESS_TTL.to_i)
    end
  end
end
