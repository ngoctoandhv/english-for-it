class RefreshToken < ApplicationRecord
  belongs_to :user

  scope :active, -> { where(revoked_at: nil).where("expires_at > ?", Time.current) }

  def self.digest(raw) = Digest::SHA256.hexdigest(raw)
  def revoke! = update!(revoked_at: Time.current)
  def revoked? = revoked_at.present?
  def expired? = expires_at <= Time.current
end
