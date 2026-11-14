module Quizzes
  # Tolerant comparison for typed answers: ignores case, spaces and hyphens, accepts a plural/singular difference,
  # and reports a one-letter slip as :close (shown as a hint, not counted as correct).
  module TypedAnswer
    def self.normalize(text) = text.to_s.downcase.gsub(/[^[:alnum:]]/, "")

    def self.check(given, expected)
      a = normalize(given)
      b = normalize(expected)
      return :wrong if a.empty?
      return :correct if a == b || a == "#{b}s" || a == "#{b}es" || "#{a}s" == b || "#{a}es" == b
      return :close if b.length > 3 && distance(a, b) <= 1

      :wrong
    end

    # Levenshtein distance, early exit when clearly far apart.
    def self.distance(a, b)
      return (a.length - b.length).abs if a.empty? || b.empty?
      return 2 if (a.length - b.length).abs > 1

      prev = (0..b.length).to_a
      a.each_char.with_index(1) do |ca, i|
        cur = [ i ]
        b.each_char.with_index(1) do |cb, j|
          cur << [ prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca == cb ? 0 : 1) ].min
        end
        prev = cur
      end
      prev.last
    end
  end
end
