const fs = require('fs');

const createPage = (title, content) => `<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#080505" />
    <title>${title} — Maldalla Duy Đức</title>
    <meta name="description" content="${title} của Maldalla Duy Đức." />
    <meta property="og:title" content="${title} — Maldalla Duy Đức" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="vi_VN" />
    <link rel="icon" type="image/svg+xml"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
        rel="stylesheet" />
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --bg: #050505;
            --bg-warm: #0c0a08;
            --gold: #d4a853;
            --gold-light: #e8c97a;
            --text: #f5f0e8;
            --text-sec: #b0a596;
            --text-muted: #665e52;
            --border: rgba(212, 168, 83, 0.12);
        }
        html { scroll-behavior: smooth; }
        body {
            font-family: 'Be Vietnam Pro', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.85;
            font-size: 16px;
        }
        .s-nav {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            padding: 16px 32px;
            display: flex; justify-content: space-between; align-items: center;
            background: rgba(5, 5, 5, 0.92);
            border-bottom: 1px solid var(--border);
        }
        .s-nav a { color: var(--text-sec); text-decoration: none; font-size: 14px; }
        .s-nav a:hover { color: var(--gold-light); }
        .s-nav .brand { font-weight: 700; color: var(--gold-light); font-size: 15px; letter-spacing: 0.5px; }

        .policy-page {
            max-width: 760px;
            margin: 0 auto;
            padding: 120px 24px 80px;
        }
        .policy-page h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; color: var(--gold-light); }
        .policy-date { font-size: 13px; color: var(--text-muted); margin-bottom: 40px; }
        .policy-page h2 {
            font-size: 1.2rem; font-weight: 600; color: var(--gold);
            margin: 36px 0 12px; padding-top: 20px; border-top: 1px solid var(--border);
        }
        .policy-page h2:first-of-type { border-top: none; padding-top: 0; }
        .policy-page p { color: var(--text-sec); margin-bottom: 14px; }
        .policy-page ul { color: var(--text-sec); padding-left: 20px; margin-bottom: 14px; }
        .policy-page li { margin-bottom: 8px; }
        .policy-page strong { color: var(--text); font-weight: 600; }
        
        .highlight-box {
            background: rgba(212, 168, 83, 0.06);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
            color: var(--gold-light);
        }
        .highlight-box p { margin-bottom: 0; }

        .s-footer {
            text-align: center; padding: 28px; font-size: 13px; color: var(--text-muted);
            border-top: 1px solid var(--border);
        }
        .s-footer a { color: var(--gold); text-decoration: none; }

        @media (max-width: 600px) {
            .s-nav { padding: 12px 16px; }
            .policy-page h1 { font-size: 1.5rem; }
        }
    </style>
</head>

<body>
    <nav class="s-nav">
        <a href="/">← Trang chủ</a>
        <span class="brand">✨ Maldalla Duy Đức</span>
        <a href="/index.html#partnership">Liên Hệ</a>
    </nav>

    <main class="policy-page">
        <h1>${title}</h1>
        <p class="policy-date">Ngày có hiệu lực: 28/02/2026 — Cập nhật gần nhất: 28/02/2026</p>
        ${content}
    </main>

    <footer class="s-footer">
        <p>© 2026 <a href="/">Maldalla Duy Đức</a> — Đông Trùng Hạ Thảo Nguyên Chất</p>
    </footer>
</body>
</html>`;

const baoMatContent = `
        <h2>Giới thiệu</h2>
        <p>Chính sách bảo mật này mô tả cách thức Công ty [Tên pháp lý đầy đủ theo ĐKKD], Mã số thuế: [MST], Giấy chứng nhận ĐKKD số: [Số ĐKKD], do [Cơ quan cấp] cấp ngày [Ngày cấp], trụ sở tại [Địa chỉ đầy đủ] (sau đây gọi là "Chúng tôi" hoặc "Maldalla Duy Đức") thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ dữ liệu cá nhân của bạn khi bạn truy cập website maldalladuyduc.com (sau đây gọi là "Website").</p>
        <p>Chính sách này tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, Luật An ninh mạng số 24/2018/QH14, Luật Giao dịch điện tử số 20/2023/QH15, và các quy định pháp luật hiện hành.</p>
        <p>Bằng việc truy cập Website và/hoặc gửi thông tin qua các biểu mẫu trên Website, bạn xác nhận đã đọc, hiểu và đồng ý với Chính sách bảo mật này. Sự đồng ý này đáp ứng yêu cầu tại Điều 11, Nghị định 13/2023/NĐ-CP.</p>
        
        <h2>Điều 1. Định nghĩa</h2>
        <ul>
            <li><strong>"Dữ liệu cá nhân"</strong> là thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh hoặc dạng tương tự trên môi trường điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể (Khoản 1, Điều 2, NĐ 13/2023/NĐ-CP).</li>
            <li><strong>"Dữ liệu cá nhân cơ bản"</strong> bao gồm: họ tên, ngày sinh, số điện thoại, email, địa chỉ liên hệ (Khoản 3, Điều 2, NĐ 13/2023).</li>
            <li><strong>"Dữ liệu cá nhân nhạy cảm"</strong> bao gồm: thông tin y tế, tài chính, CMND/CCCD, quan điểm chính trị, tôn giáo, sinh trắc học (Khoản 4, Điều 2, NĐ 13/2023).</li>
            <li><strong>"Xử lý dữ liệu cá nhân"</strong> là bất kỳ hoạt động nào tác động đến dữ liệu cá nhân: thu thập, ghi, phân tích, xác nhận, lưu trữ, chỉnh sửa, công khai, kết hợp, truy cập, truy xuất, thu hồi, mã hóa, giải mã, sao chép, chia sẻ, truyền đưa, cung cấp, chuyển giao, xóa, hủy (Khoản 7, Điều 2, NĐ 13/2023).</li>
        </ul>

        <h2>Điều 2. Dữ liệu cá nhân chúng tôi thu thập</h2>
        <p><strong>2.1. Dữ liệu cá nhân cơ bản — bạn chủ động cung cấp</strong><br>
        Khi bạn gửi biểu mẫu liên hệ hợp tác trên Website: họ và tên, số điện thoại, địa chỉ email (nếu bạn cung cấp), loại hình hợp tác bạn quan tâm, nội dung tin nhắn, khu vực hoạt động (nếu bạn cung cấp).</p>
        <p><strong>2.2. Dữ liệu kỹ thuật — thu thập tự động</strong><br>
        Địa chỉ IP, loại trình duyệt, hệ điều hành, thiết bị, thời gian truy cập, trang đã xem, thời gian trên trang, nguồn truy cập (referrer), dữ liệu cookie (xem Điều 6).</p>
        <div class="highlight-box">
            <p><strong>2.3. Dữ liệu chúng tôi KHÔNG thu thập</strong><br>
            Chúng tôi không thu thập dữ liệu cá nhân nhạy cảm: thông tin y tế, tài chính (số tài khoản, thẻ tín dụng), số CMND/CCCD, thông tin về quan điểm chính trị, tôn giáo, đời sống tình dục, dữ liệu sinh trắc học, hoặc dữ liệu vị trí thời gian thực.</p>
        </div>

        <h2>Điều 3. Mục đích và phạm vi xử lý dữ liệu</h2>
        <p>Chúng tôi xử lý dữ liệu cá nhân cho các mục đích:</p>
        <ul>
            <li>Phản hồi yêu cầu hợp tác và liên hệ tư vấn chương trình đại lý;</li>
            <li>Liên hệ lại theo thông tin bạn cung cấp;</li>
            <li>Cải thiện trải nghiệm người dùng trên Website (phân tích dữ liệu kỹ thuật ẩn danh);</li>
            <li>Tuân thủ yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định pháp luật.</li>
        </ul>
        <p>Chúng tôi chỉ xử lý dữ liệu trong phạm vi mục đích nêu trên. Thay đổi mục đích xử lý yêu cầu sự đồng ý mới của bạn (Điều 11, NĐ 13/2023).</p>

        <h2>Điều 4. Căn cứ pháp lý để xử lý dữ liệu</h2>
        <ul>
            <li>Sự đồng ý của bạn khi chủ động gửi thông tin qua biểu mẫu (Điều 11, NĐ 13/2023);</li>
            <li>Thực hiện hợp đồng hoặc giai đoạn tiền hợp đồng khi bạn yêu cầu tìm hiểu hợp tác;</li>
            <li>Nghĩa vụ pháp lý khi cơ quan có thẩm quyền yêu cầu.</li>
        </ul>

        <h2>Điều 5. Chia sẻ dữ liệu cá nhân</h2>
        <p>Chúng tôi <strong>KHÔNG</strong> bán, cho thuê, trao đổi dữ liệu cá nhân vì mục đích thương mại.</p>
        <p>Chia sẻ dữ liệu chỉ xảy ra khi:</p>
        <ul>
            <li>Nhà cung cấp dịch vụ kỹ thuật (hosting, analytics) — trên cơ sở hợp đồng bảo mật, chỉ xử lý dữ liệu theo chỉ định của chúng tôi;</li>
            <li>Cơ quan nhà nước có thẩm quyền yêu cầu theo quy định pháp luật;</li>
            <li>Bạn đồng ý rõ ràng bằng văn bản hoặc hình thức tương đương.</li>
        </ul>
        <p>Chuyển dữ liệu ra nước ngoài (nếu có — ví dụ: dịch vụ lưu trữ đám mây quốc tế) tuân thủ Điều 25, NĐ 13/2023/NĐ-CP: lập hồ sơ đánh giá tác động, bảo đảm bên nhận có biện pháp bảo vệ tương đương.</p>

        <h2>Điều 6. Cookie và công nghệ theo dõi</h2>
        <p>Cookie phiên (session): duy trì truy cập, tự xóa khi đóng trình duyệt.<br>
        Cookie phân tích (analytics): đo lường lưu lượng, cải thiện Website — lưu tối đa 12 tháng.<br>
        Bạn có thể từ chối cookie qua cài đặt trình duyệt. Từ chối cookie có thể ảnh hưởng đến một số chức năng. Chúng tôi không sử dụng cookie để thu thập dữ liệu nhạy cảm hoặc phục vụ quảng cáo bên thứ ba.</p>

        <h2>Điều 7. Thời gian lưu trữ</h2>
        <p>Biểu mẫu liên hệ hợp tác: tối đa 24 tháng kể từ ngày gửi, hoặc đến khi mục đích xử lý hoàn tất.<br>
        Dữ liệu kỹ thuật (log): tối đa 12 tháng. Sau thời hạn: xóa hoặc ẩn danh hóa.<br>
        Pháp luật yêu cầu lưu trữ lâu hơn (thuế, kiểm toán): tuân thủ thời hạn quy định.</p>

        <h2>Điều 8. Quyền của chủ thể dữ liệu</h2>
        <p>Theo Điều 9, NĐ 13/2023/NĐ-CP, bạn có 11 quyền: (1) Quyền được biết về việc xử lý dữ liệu cá nhân; (2) Quyền đồng ý hoặc không đồng ý; (3) Quyền truy cập, xem, chỉnh sửa; (4) Quyền rút lại sự đồng ý; (5) Quyền xóa dữ liệu; (6) Quyền hạn chế xử lý; (7) Quyền cung cấp dữ liệu; (8) Quyền phản đối xử lý; (9) Quyền khiếu nại, tố cáo, khởi kiện; (10) Quyền yêu cầu bồi thường thiệt hại; (11) Quyền tự bảo vệ.</p>
        <p>Cách thực hiện: Liên hệ theo thông tin tại Điều 12. Chúng tôi phản hồi trong 72 giờ làm việc (Điều 14, NĐ 13/2023).</p>

        <h2>Điều 9. Biện pháp bảo vệ</h2>
        <p>Mã hóa SSL/TLS toàn Website; kiểm soát quyền truy cập hệ thống lưu trữ; không lưu dữ liệu nhạy cảm trên thiết bị cá nhân; đào tạo nhân sự về bảo vệ dữ liệu.<br>
        Sự cố vi phạm dữ liệu: thông báo Cục An ninh mạng (Bộ Công an) trong 72 giờ (Điều 23, NĐ 13/2023) và thông báo chủ thể dữ liệu bị ảnh hưởng.</p>

        <h2>Điều 10. Bảo vệ dữ liệu trẻ em</h2>
        <p>Website không hướng đến trẻ em dưới 16 tuổi. Không chủ đích thu thập dữ liệu của trẻ em. Nếu phát hiện — xóa ngay. Trẻ em từ 7 đến dưới 16 tuổi: xử lý dữ liệu phải có đồng ý của cha mẹ hoặc người giám hộ (Điều 20, NĐ 13/2023).</p>

        <h2>Điều 11. Thay đổi chính sách</h2>
        <p>Cập nhật được công bố tại trang này kèm ngày mới. Thay đổi trọng yếu ảnh hưởng đến quyền của bạn: thông báo rõ ràng trên Website trước khi có hiệu lực.</p>

        <h2>Điều 12. Liên hệ</h2>
        <p>Bộ phận phụ trách bảo vệ dữ liệu cá nhân:<br>
        Công ty: [Tên pháp lý đầy đủ] — Địa chỉ: [Địa chỉ trụ sở]<br>
        Điện thoại: 0903.940.171 — Email: [email bảo mật]<br>
        Cơ quan tiếp nhận khiếu nại: Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao, Bộ Công an — cơ quan chuyên trách bảo vệ dữ liệu cá nhân theo NĐ 13/2023/NĐ-CP.</p>
`;

const doiTraContent = `
        <h2>Giới thiệu</h2>
        <p>Maldalla Duy Đức là nhà sản xuất và nhà phân phối Đông Trùng Hạ Thảo nguyên chất. Website maldalladuyduc.com không bán lẻ trực tiếp. Sản phẩm được phân phối thông qua hệ thống Đại lý chính thức theo mô hình đại lý thương mại quy định tại Điều 166 đến 177, Luật Thương mại số 36/2005/QH11.</p>

        <h2>Điều 1. Trách nhiệm của Nhà sản xuất về chất lượng</h2>
        <p>Theo Luật Chất lượng sản phẩm, hàng hóa số 05/2007/QH12 (Chương IV), Maldalla Duy Đức chịu trách nhiệm:</p>
        <ul>
            <li>Bảo đảm chất lượng sản phẩm phù hợp với tiêu chuẩn công bố, quy chuẩn kỹ thuật tương ứng.</li>
            <li>Thực hiện nghĩa vụ truy xuất nguồn gốc: mỗi mẻ sản xuất có hồ sơ truy xuất đầy đủ từ nguyên liệu đến thành phẩm.</li>
            <li>Thu hồi sản phẩm có khuyết tật hoặc không phù hợp tiêu chuẩn đã công bố khi phát hiện hoặc khi có yêu cầu của cơ quan nhà nước.</li>
            <li>Bồi thường thiệt hại theo quy định pháp luật nếu sản phẩm gây thiệt hại do lỗi sản xuất.</li>
        </ul>

        <h2>Điều 2. Đổi trả giữa Nhà sản xuất và Đại lý</h2>
        <p><strong>2.1. Phạm vi áp dụng</strong><br>
        Quan hệ giữa Maldalla Duy Đức (bên giao đại lý) và Đại lý (bên đại lý) chịu sự điều chỉnh của hợp đồng đại lý thương mại. Theo Điều 168, Luật Thương mại 2005 — hợp đồng đại lý phải lập bằng văn bản hoặc hình thức có giá trị pháp lý tương đương.</p>
        <p><strong>2.2. Trường hợp Nhà sản xuất chịu trách nhiệm đổi trả</strong></p>
        <ul>
            <li>Sản phẩm bị hư hỏng do lỗi sản xuất (viên nang vỡ, bột bị ẩm, đổi màu bất thường);</li>
            <li>Sản phẩm không đúng quy cách đã cam kết trong hợp đồng;</li>
            <li>Bao bì bị hư hỏng, tem seal bị phá trong quá trình vận chuyển từ nhà sản xuất;</li>
            <li>Sản phẩm hết hạn sử dụng tại thời điểm giao cho Đại lý.</li>
        </ul>
        <p><strong>2.3. Thời hạn và thủ tục</strong><br>
        Đại lý thông báo trong vòng 7 ngày làm việc kể từ ngày nhận hàng. Cung cấp hình ảnh, video hoặc mẫu sản phẩm lỗi. Sản phẩm lỗi được xử lý theo hướng dẫn của nhà sản xuất.</p>
        <p><strong>2.4. Hình thức xử lý</strong><br>
        Đổi sản phẩm mới cùng loại, cùng số lượng; hoặc hoàn tiền theo giá trị hợp đồng đại lý. Thời gian xử lý: trong vòng 7 ngày làm việc kể từ khi xác nhận lỗi.</p>

        <h2>Điều 3. Đổi trả đối với Người tiêu dùng cuối</h2>
        <p><strong>3.1. Nguyên tắc phân định trách nhiệm</strong><br>
        Việc bán hàng đến người tiêu dùng cuối do Đại lý thực hiện. Theo Điều 169, Luật Thương mại 2005, bên đại lý nhân danh chính mình mua bán hàng hóa cho bên giao đại lý. Do đó, Đại lý là bên trực tiếp chịu trách nhiệm với người tiêu dùng về chính sách đổi trả bán lẻ.<br>
        Maldalla Duy Đức (nhà sản xuất) cam kết chất lượng sản phẩm đến tay Đại lý. Đại lý cam kết chất lượng đến tay người tiêu dùng.</p>
        <p><strong>3.2. Khuyến nghị chính sách tối thiểu cho Đại lý</strong><br>
        Thời hạn đổi trả: 7 ngày kể từ ngày người tiêu dùng nhận hàng. Điều kiện: sản phẩm còn nguyên seal, chưa mở nắp, còn nguyên bao bì. Hình thức: đổi sản phẩm hoặc hoàn tiền (tùy chính sách từng Đại lý). Đây là khuyến nghị — chính sách cụ thể do Đại lý tự quyết định và công bố.</p>
        <p><strong>3.3. Sản phẩm lỗi từ nhà sản xuất</strong><br>
        Nếu người tiêu dùng phát hiện lỗi sản xuất: liên hệ Đại lý nơi mua. Đại lý phối hợp Maldalla Duy Đức xử lý. Người tiêu dùng cũng có thể liên hệ trực tiếp nhà sản xuất: 0903.940.171.</p>

        <h2>Điều 4. Trường hợp KHÔNG áp dụng đổi trả</h2>
        <ul>
            <li>Sản phẩm đã mở seal, đã sử dụng (trừ lỗi sản xuất);</li>
            <li>Hư hỏng do bảo quản không đúng cách (nhiệt độ cao, ẩm ướt, ánh sáng trực tiếp);</li>
            <li>Sản phẩm không mua từ hệ thống Đại lý chính thức;</li>
            <li>Yêu cầu sau thời hạn quy định.</li>
        </ul>

        <h2>Điều 5. Cam kết chất lượng</h2>
        <p>Sản phẩm đạt chuẩn GMP-WHO (Good Manufacturing Practice — tiêu chuẩn Tổ chức Y tế Thế giới về quy trình sản xuất). Mỗi mẻ có hồ sơ truy xuất nguồn gốc. Kiểm nghiệm chất lượng trước khi xuất xưởng.</p>
        <div class="highlight-box">
            <p><strong>KHUYẾN CÁO BẮT BUỘC:</strong> "Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh." (Khoản 3, Điều 27, NĐ 15/2018/NĐ-CP)</p>
        </div>

        <h2>Điều 6. Giải quyết tranh chấp</h2>
        <p><strong>Giữa Nhà sản xuất và Đại lý:</strong> Theo hợp đồng đại lý và Luật Thương mại 2005. Ưu tiên thương lượng, hòa giải. Không đạt thỏa thuận: trọng tài thương mại hoặc Tòa án nhân dân có thẩm quyền.</p>
        <p><strong>Giữa Đại lý và Người tiêu dùng:</strong> Theo Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15. Người tiêu dùng có quyền khiếu nại đến cơ quan bảo vệ quyền lợi người tiêu dùng cấp tỉnh/thành phố. Maldalla Duy Đức hỗ trợ Đại lý giải quyết nếu liên quan đến chất lượng sản phẩm.</p>
        <p><strong>Vi phạm hành chính:</strong> Các hành vi vi phạm liên quan đến chất lượng hàng hóa, quyền lợi người tiêu dùng có thể bị xử phạt theo NĐ 98/2020/NĐ-CP (sửa đổi bởi NĐ 24/2025). Vi phạm về an toàn thực phẩm bị xử phạt theo NĐ 115/2018/NĐ-CP — mức phạt tối đa đến 7 lần giá trị hàng hóa vi phạm.</p>
`;

const dieuKhoanContent = `
        <h2>Giới thiệu</h2>
        <p>Điều khoản này điều chỉnh việc truy cập và sử dụng website maldalladuyduc.com do Công ty [Tên pháp lý], MST: [MST], trụ sở tại [Địa chỉ] vận hành. Bằng việc truy cập Website, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>

        <h2>Điều 1. Tính chất của Website</h2>
        <p>Website là kênh thông tin chính thức của Maldalla Duy Đức — nhà sản xuất và nhà phân phối Đông Trùng Hạ Thảo nguyên chất. Website cung cấp: thông tin sản phẩm, quy trình sản xuất, câu chuyện thương hiệu, chương trình hợp tác đại lý, biểu mẫu liên hệ. Website <strong>KHÔNG</strong> phải website bán hàng. Không thực hiện giao dịch mua bán trực tuyến. Việc mua bán do hệ thống Đại lý chính thức thực hiện.</p>
        <p>Theo NĐ 52/2013/NĐ-CP (sửa đổi bởi NĐ 85/2021), Website thuộc loại website thương mại điện tử bán hàng của thương nhân có chức năng giới thiệu sản phẩm. Thông tin bắt buộc công bố theo Điều 29, NĐ 52/2013: tên đầy đủ, địa chỉ, SĐT, email, MST, số ĐKKD.</p>

        <h2>Điều 2. Phân loại sản phẩm và giới hạn nội dung</h2>
        <p><strong>Phân loại pháp lý:</strong> Sản phẩm Maldalla Duy Đức là thực phẩm bảo vệ sức khỏe (TPBVSK) theo Khoản 1, Điều 3, NĐ 15/2018/NĐ-CP — sản phẩm dùng để bổ sung vào chế độ ăn uống nhằm duy trì, tăng cường, cải thiện các chức năng cơ thể, giảm nguy cơ mắc bệnh.</p>
        
        <div class="highlight-box">
            <p><strong>KHUYẾN CÁO BẮT BUỘC:</strong> "Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh." — Hiển thị chữ rõ ràng, màu tương phản với màu nền, tại footer toàn site và mọi vị trí nhắc đến công dụng sản phẩm (Khoản 3a, Điều 27, NĐ 15/2018).</p>
        </div>

        <p><strong>Giới hạn về nội dung quảng cáo (NĐ 15/2018 + Luật Quảng cáo 2012 + NĐ 181/2013)</strong><br>
        <strong>CẤM:</strong> Sử dụng hình ảnh, tên, thư tín của bác sĩ, dược sĩ, nhân viên y tế. Sử dụng thư cảm ơn của người bệnh. Quảng cáo gây hiểu nhầm sản phẩm là thuốc. Nội dung vượt quá công dụng đã công bố trong bản công bố sản phẩm.</p>
        <p><strong>Về "Chia sẻ từ người dùng":</strong> Đây là trải nghiệm cá nhân, không phải quảng cáo sản phẩm. Kết quả có thể khác nhau tùy cơ địa và tình trạng sức khỏe. Nội dung quảng cáo phải phù hợp với công dụng đã công bố (Khoản 2, Điều 27, NĐ 15/2018). Lưu ý: nếu cách trình bày testimonials bị coi là quảng cáo → phải tuân thủ toàn bộ quy định quảng cáo TPBVSK.</p>
        <p>Chúng tôi khuyến nghị tham khảo ý kiến bác sĩ trước khi sử dụng bất kỳ thực phẩm bảo vệ sức khỏe nào, đặc biệt nếu đang mang thai, cho con bú, điều trị bệnh, hoặc sử dụng thuốc.</p>

        <h2>Điều 3. Sở hữu trí tuệ</h2>
        <p>Toàn bộ nội dung trên Website — văn bản, hình ảnh, logo, thiết kế, mã nguồn — là tài sản sở hữu trí tuệ của Maldalla Duy Đức, được bảo hộ theo Luật Sở hữu trí tuệ số 50/2005/QH11 (sửa đổi 2009, 2019, 2022). Thương hiệu "Maldalla Duy Đức", logo, và dấu hiệu nhận diện là nhãn hiệu đã đăng ký hoặc đang trong quá trình đăng ký bảo hộ. Sử dụng trái phép bị xử lý theo pháp luật SHTT và NĐ 98/2020/NĐ-CP. Cấm sao chép, phân phối, sửa đổi, tái xuất bản vì mục đích thương mại mà không có đồng ý bằng văn bản.</p>

        <h2>Điều 4. Biểu mẫu liên hệ hợp tác</h2>
        <p>Biểu mẫu trên Website là hình thức giao dịch điện tử hợp lệ theo Luật Giao dịch điện tử số 20/2023/QH15. Thông tin gửi qua biểu mẫu có giá trị pháp lý tương đương hình thức liên hệ truyền thống. Bạn cam kết cung cấp thông tin chính xác, trung thực. Gửi biểu mẫu <strong>KHÔNG</strong> tạo thành hợp đồng hoặc cam kết hợp tác. Đây là yêu cầu tìm hiểu. Điều khoản hợp tác cụ thể được thỏa thuận bằng hợp đồng đại lý thương mại theo Điều 168, Luật Thương mại 2005. Thông tin bạn cung cấp được xử lý theo Chính sách bảo mật.</p>

        <h2>Điều 5. Hệ thống Đại lý và tài khoản</h2>
        <p>Một số khu vực Website yêu cầu tài khoản đăng nhập (dành cho Đại lý chính thức). Quan hệ giữa Maldalla Duy Đức và Đại lý là quan hệ đại lý thương mại theo Luật Thương mại 2005, không phải quan hệ lao động. Đại lý chịu trách nhiệm bảo mật tài khoản. Chúng tôi có quyền tạm khóa hoặc vô hiệu hóa tài khoản khi phát hiện vi phạm.</p>

        <h2>Điều 6. Hành vi bị cấm</h2>
        <p>Khi sử dụng Website, bạn không được: sử dụng cho mục đích bất hợp pháp; gây gián đoạn, phá hoại hoạt động Website; truy cập trái phép vào hệ thống, dữ liệu; thu thập dữ liệu cá nhân người dùng khác; đăng tải nội dung xúc phạm, bôi nhọ, vi phạm pháp luật; mạo danh Maldalla Duy Đức hoặc Đại lý chính thức; sử dụng phần mềm tự động (bot, scraper) để thu thập dữ liệu.</p>
        <p>Vi phạm có thể bị xử lý theo Luật An ninh mạng 2018, NĐ 98/2020/NĐ-CP (mức phạt tối đa 200 triệu đồng đối với tổ chức), và pháp luật hình sự nếu đủ yếu tố cấu thành tội phạm.</p>

        <h2>Điều 7. Giới hạn trách nhiệm</h2>
        <p>Chúng tôi nỗ lực cung cấp thông tin chính xác, cập nhật. Tuy nhiên, không đảm bảo tính đầy đủ, chính xác tuyệt đối tại mọi thời điểm. Không chịu trách nhiệm về thiệt hại phát sinh từ gián đoạn dịch vụ, lỗi kỹ thuật, hoặc việc bạn dựa vào thông tin trên Website để đưa ra quyết định sức khỏe mà không tham khảo bác sĩ. Giới hạn này không ảnh hưởng đến trách nhiệm bắt buộc của nhà sản xuất theo Luật Chất lượng SPHH 2007 và Luật BVQLNTD 2023.</p>

        <h2>Điều 8. Luật áp dụng và giải quyết tranh chấp</h2>
        <p>Điều khoản này chịu sự điều chỉnh của pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Tranh chấp được giải quyết qua thương lượng. Không đạt thỏa thuận: Tòa án nhân dân có thẩm quyền tại TP. Hồ Chí Minh.</p>

        <h2>Điều 9. Thông tin doanh nghiệp</h2>
        <p>Theo Điều 29, NĐ 52/2013/NĐ-CP (sửa đổi bởi NĐ 85/2021), công bố:<br>
        Tên thương nhân: [Tên pháp lý đầy đủ] — Địa chỉ: [Địa chỉ]<br>
        SĐT: 0903.940.171 — Email: [email] — MST: [MST]<br>
        ĐKKD: [Số ĐKKD] — Do [Cơ quan] cấp ngày [Ngày]<br>
        Người đại diện pháp luật: [Tên]<br>
        Ngành nghề chính: Sản xuất và phân phối thực phẩm bảo vệ sức khỏe.</p>
`;

fs.writeFileSync('/Volumes/Personal/DongTrungHaThao/chinh-sach-bao-mat.html', createPage('Chính Sách Bảo Mật', baoMatContent));
fs.writeFileSync('/Volumes/Personal/DongTrungHaThao/chinh-sach-doi-tra.html', createPage('Chính Sách Đổi Trả', doiTraContent));
fs.writeFileSync('/Volumes/Personal/DongTrungHaThao/dieu-khoan-su-dung.html', createPage('Điều Khoản Sử Dụng', dieuKhoanContent));
