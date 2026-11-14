class PushSubscription < ApplicationRecord
  MAX_PER_USER = 10

  belongs_to :user
  validates :endpoint, presence: true, uniqueness: true, length: { maximum: 2000 }, format: { with: %r{\Ahttps://\S+\z}, message: "must be https" }
  validates :p256dh, :auth, presence: true
  validate :within_limit, on: :create

  private

  def within_limit
    errors.add(:base, "Too many devices") if user && user.push_subscriptions.count >= MAX_PER_USER
  end
end
