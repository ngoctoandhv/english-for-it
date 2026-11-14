// Plain-language privacy policy and terms. Review with a lawyer before a public launch; update "updated" when text changes.
import type { Lang } from "@/lib/i18n/dictionaries";

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { title: string; updated: string; sections: LegalSection[] };

const UPDATED = "2026-11-14";

export const PRIVACY: Record<Lang, LegalDoc> = {
  en: {
    title: "Privacy policy",
    updated: UPDATED,
    sections: [
      { heading: "What we store", body: [
        "Your account: name, email address and a password hash (we never store your password itself).",
        "Your learning data: the words you studied, review results and schedules, quiz and listening scores, scenario progress, favourites, level, daily goal, role, main goal and time zone.",
        "Product events: simple records such as “opened the app”, “started a session” or “finished a unit”. They hold ids and counts, not your answers or free text.",
        "Reports you send about a mistake in the content, with your message.",
      ] },
      { heading: "What we do not do", body: [
        "No advertising, no selling of data and no third-party analytics or tracking scripts.",
        "No cookies. The app keeps your sign-in tokens, language and theme in your browser’s local storage.",
      ] },
      { heading: "Email", body: [
        "We send an email only to confirm your address or to reset your password. It goes through an email delivery provider that sees your address and the message.",
      ] },
      { heading: "Speaking practice", body: [
        "Recording and scoring happen in your browser; we do not upload your voice. Some browsers (for example Chrome) send speech to their own recognition service to turn it into text. That is the browser’s feature and follows the browser vendor’s policy.",
      ] },
      { heading: "Your choices", body: [
        "In Settings you can download all your data as a file, change your details and delete your account. Deleting removes your account, progress, review history and events permanently.",
      ] },
      { heading: "Keeping data safe", body: [
        "Passwords are hashed, connections use HTTPS, and sessions can be ended by changing your password. No system is perfectly secure, so please use a strong, unique password.",
      ] },
      { heading: "Children", body: ["The service is meant for adults and people 16 and older."] },
      { heading: "Changes and questions", body: [
        "If this policy changes, the date above changes with it. To ask a question, use the “Report a mistake” button in the app or the contact address of the service operator.",
      ] },
    ],
  },
  vi: {
    title: "Chính sách quyền riêng tư",
    updated: UPDATED,
    sections: [
      { heading: "Chúng tôi lưu những gì", body: [
        "Tài khoản của bạn: tên, địa chỉ email và mã băm mật khẩu (chúng tôi không bao giờ lưu chính mật khẩu).",
        "Dữ liệu học tập: các từ bạn đã học, kết quả và lịch ôn tập, điểm bài kiểm tra và bài nghe, tiến độ tình huống, từ yêu thích, trình độ, mục tiêu mỗi ngày, vai trò, mục tiêu chính và múi giờ.",
        "Sự kiện sản phẩm: các bản ghi đơn giản như “mở ứng dụng”, “bắt đầu phiên học” hay “hoàn thành một đơn vị”. Chúng chỉ chứa mã số và số đếm, không chứa câu trả lời hay văn bản tự do của bạn.",
        "Các báo lỗi nội dung bạn gửi, kèm lời nhắn của bạn.",
      ] },
      { heading: "Chúng tôi không làm gì", body: [
        "Không quảng cáo, không bán dữ liệu, không dùng công cụ phân tích hay theo dõi của bên thứ ba.",
        "Không dùng cookie. Ứng dụng giữ mã đăng nhập, ngôn ngữ và giao diện trong bộ nhớ cục bộ (local storage) của trình duyệt.",
      ] },
      { heading: "Email", body: [
        "Chúng tôi chỉ gửi email để xác nhận địa chỉ hoặc đặt lại mật khẩu. Email đi qua một nhà cung cấp dịch vụ gửi thư, nơi thấy địa chỉ và nội dung thư.",
      ] },
      { heading: "Luyện nói", body: [
        "Việc ghi âm và chấm điểm diễn ra ngay trong trình duyệt; chúng tôi không tải giọng nói của bạn lên. Một số trình duyệt (ví dụ Chrome) gửi giọng nói đến dịch vụ nhận dạng của họ để chuyển thành chữ. Đó là tính năng của trình duyệt và theo chính sách của nhà phát triển trình duyệt.",
      ] },
      { heading: "Quyền lựa chọn của bạn", body: [
        "Trong Cài đặt, bạn có thể tải toàn bộ dữ liệu về dưới dạng tệp, sửa thông tin và xóa tài khoản. Khi xóa, tài khoản, tiến độ, lịch sử ôn tập và sự kiện của bạn bị xóa vĩnh viễn.",
      ] },
      { heading: "Giữ an toàn cho dữ liệu", body: [
        "Mật khẩu được băm, kết nối dùng HTTPS, và phiên đăng nhập bị chấm dứt khi bạn đổi mật khẩu. Không hệ thống nào an toàn tuyệt đối, vì vậy hãy dùng mật khẩu mạnh và không trùng với nơi khác.",
      ] },
      { heading: "Trẻ em", body: ["Dịch vụ dành cho người trưởng thành và người từ 16 tuổi trở lên."] },
      { heading: "Thay đổi và câu hỏi", body: [
        "Nếu chính sách thay đổi, ngày ở trên sẽ thay đổi theo. Để đặt câu hỏi, hãy dùng nút “Báo lỗi nội dung” trong ứng dụng hoặc địa chỉ liên hệ của đơn vị vận hành.",
      ] },
    ],
  },
};

export const TERMS: Record<Lang, LegalDoc> = {
  en: {
    title: "Terms of use",
    updated: UPDATED,
    sections: [
      { heading: "The service", body: [
        "English for IT is a free learning tool for English used in IT work. You may use it for your own learning.",
      ] },
      { heading: "Content may contain mistakes", body: [
        "Lessons, words, translations, pronunciations and phrases are being reviewed and may contain errors. Do not rely on them for legal, medical or safety-critical communication. If you find a mistake, please report it in the app.",
      ] },
      { heading: "Your account", body: [
        "Keep your password private and give accurate information. You are responsible for activity under your account. Do not try to break, overload or scrape the service.",
      ] },
      { heading: "Generated text", body: [
        "The work toolkit fills in templates from what you type. It does not check facts or tone, so read every message before you send it.",
      ] },
      { heading: "Changes and availability", body: [
        "The service is provided as is, without a promise that it will always be available or error free. We may change or stop features. You can export or delete your data at any time in Settings.",
      ] },
      { heading: "Liability", body: [
        "To the extent the law allows, the operator is not liable for losses that result from using the service.",
      ] },
    ],
  },
  vi: {
    title: "Điều khoản sử dụng",
    updated: UPDATED,
    sections: [
      { heading: "Dịch vụ", body: [
        "English for IT là công cụ học miễn phí về tiếng Anh dùng trong công việc IT. Bạn có thể dùng để tự học.",
      ] },
      { heading: "Nội dung có thể có lỗi", body: [
        "Bài học, từ vựng, bản dịch, phát âm và cụm từ đang trong quá trình rà soát và có thể có sai sót. Đừng dựa vào chúng cho giao tiếp pháp lý, y tế hay liên quan đến an toàn. Nếu thấy lỗi, hãy báo trong ứng dụng.",
      ] },
      { heading: "Tài khoản của bạn", body: [
        "Hãy giữ kín mật khẩu và cung cấp thông tin chính xác. Bạn chịu trách nhiệm về hoạt động trong tài khoản của mình. Không cố phá hoại, làm quá tải hoặc thu thập dữ liệu hàng loạt từ dịch vụ.",
      ] },
      { heading: "Văn bản được tạo tự động", body: [
        "Bộ công cụ công việc điền vào mẫu có sẵn từ những gì bạn gõ. Nó không kiểm tra sự thật hay giọng điệu, vì vậy hãy đọc kỹ mọi tin nhắn trước khi gửi.",
      ] },
      { heading: "Thay đổi và tính sẵn sàng", body: [
        "Dịch vụ được cung cấp nguyên trạng, không cam kết luôn hoạt động hoặc không có lỗi. Chúng tôi có thể thay đổi hoặc dừng tính năng. Bạn có thể xuất hoặc xóa dữ liệu bất cứ lúc nào trong Cài đặt.",
      ] },
      { heading: "Trách nhiệm", body: [
        "Trong phạm vi pháp luật cho phép, đơn vị vận hành không chịu trách nhiệm về tổn thất phát sinh từ việc sử dụng dịch vụ.",
      ] },
    ],
  },
};
