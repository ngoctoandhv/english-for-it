# Rejects malformed or oversized JSON request bodies with the API's standard error shape, before Rails tries to
# parse them (a parse error would otherwise surface as an HTML/500 response).
class JsonBodyGuard
  MAX_BYTES = 1.megabyte

  def initialize(app)
    @app = app
  end

  def call(env)
    if json_request?(env)
      body = env["rack.input"].read(MAX_BYTES + 1).to_s
      env["rack.input"].rewind
      return error(413, "payload_too_large", "Request body is too large") if body.bytesize > MAX_BYTES

      begin
        JSON.parse(body) unless body.empty?
      rescue JSON::ParserError
        return error(400, "bad_request", "Request body is not valid JSON")
      end
    end
    @app.call(env)
  end

  private

  def json_request?(env)
    env["CONTENT_TYPE"].to_s.start_with?("application/json") && env["rack.input"]
  end

  def error(status, code, message)
    body = { error: { code: code, message: message, details: nil } }.to_json
    [ status, { "Content-Type" => "application/json", "Content-Length" => body.bytesize.to_s }, [ body ] ]
  end
end
