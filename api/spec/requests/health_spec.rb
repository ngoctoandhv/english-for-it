require "rails_helper"

RSpec.describe "GET /api/v1/health", type: :request do
  it "reports the service and its dependencies" do
    get "/api/v1/health"

    expect(response).to have_http_status(:ok)
    body = response.parsed_body
    expect(body["status"]).to eq("ok")
    expect(body["database"]).to be(true)
  end

  it "returns the standard error shape for unknown records" do
    stub_const("Api::V1::HealthController", Class.new(Api::V1::BaseController) do
      def show = raise(ActiveRecord::RecordNotFound)
    end)

    get "/api/v1/health"

    expect(response).to have_http_status(:not_found)
    expect(response.parsed_body.dig("error", "code")).to eq("not_found")
  end
end
