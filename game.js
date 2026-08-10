// --- 1. DỮ LIỆU GAME (STATE) ---
let gameState = {
    day: 1,
    stats: { marketDynamics: 50, socialEquity: 50, institutionalDiscipline: 50 },
    bufferStats: { marketDynamics: 0, socialEquity: 0, institutionalDiscipline: 0 },
    nightlyBudget: 10,
    allocated: { market: 0, equity: 0, discipline: 0 },
    solvedCases: new Set(),
    todayCases: [],
    currentCaseIndex: 0,
    pendingHeadlines: []
};

// --- 1b. HIỆU ỨNG CHUYỂN CẢNH & CHỈ BÁO BUỔI TRONG NGÀY ---
function switchPhase(hideEl, showEl) {
    if (hideEl && hideEl !== showEl) {
        hideEl.classList.add('phase-fade-out');
        setTimeout(() => {
            hideEl.style.display = 'none';
            hideEl.classList.remove('phase-fade-out');
        }, 320);
        setTimeout(() => {
            showEl.style.display = 'block';
        }, 320);
    } else {
        showEl.style.display = 'block';
    }
}

function setDaytime(icon, label, phaseClass) {
    let stepMorning = document.getElementById('step-morning');
    let stepNoon = document.getElementById('step-noon');
    let stepEvening = document.getElementById('step-evening');
    
    if (stepMorning && stepNoon && stepEvening) {
        stepMorning.classList.remove('active');
        stepNoon.classList.remove('active');
        stepEvening.classList.remove('active');
        
        if (phaseClass === 'daytime-morning') stepMorning.classList.add('active');
        if (phaseClass === 'daytime-noon') stepNoon.classList.add('active');
        if (phaseClass === 'daytime-evening') stepEvening.classList.add('active');
    }

    // Đổi màu nền toàn trang theo buổi (sáng/trưa/tối)
    document.body.classList.remove('time-morning', 'time-noon', 'time-evening');
    document.body.classList.add(phaseClass.replace('daytime-', 'time-'));
}

function playAnim(el, className) {
    el.classList.remove(className);
    void el.offsetWidth; // buộc reflow để animation chạy lại từ đầu
    el.classList.add(className);
}

// --- 2. CƠ SỞ DỮ LIỆU HỒ SƠ CÙNG CỐ VẤN ---
const caseDatabase = [
    {
        id: "Q101",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #101",
        description: "Để thu hút tập đoàn công nghệ lớn mở nhà máy, họ yêu cầu được áp dụng cơ chế \"thử việc 12 tháng với 70% lương\" cho lao động địa phương. Đề xuất giải quyết: Chấp nhận thỏa thuận để tạo hàng ngàn việc làm mới và thúc đẩy chuyển giao công nghệ.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Bất kể mục tiêu thu hút đầu tư, sức lao động là hàng hóa đặc biệt cần được bảo vệ giá trị để đảm bảo tái sản xuất; Nhà nước không hạ chuẩn pháp lý an sinh để chạy theo FDI.",
            equity: "Bất kể mục tiêu thu hút đầu tư, sức lao động là hàng hóa đặc biệt cần được bảo vệ giá trị để đảm bảo tái sản xuất; Nhà nước không hạ chuẩn pháp lý an sinh để chạy theo FDI.",
            discipline: "Bất kể mục tiêu thu hút đầu tư, sức lao động là hàng hóa đặc biệt cần được bảo vệ giá trị để đảm bảo tái sản xuất; Nhà nước không hạ chuẩn pháp lý an sinh để chạy theo FDI."
        },
        onApprove: { market: 35, equity: -35, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Nhà máy FDI tỷ đô khởi công thuận lợi, tạo hàng ngàn việc làm. Tuy nhiên, người lao động bức xúc vì thời gian thử việc 12 tháng với mức lương chỉ 70%." },
        onReject: { market: -25, equity: 20, discipline: 30, headline: "BÁO CHÍ ĐƯA TIN: Nhà đầu tư FDI rút lui do không được áp dụng cơ chế thử việc đặc thù vượt luật. Tăng trưởng kinh tế bị chậm lại, nhưng kỷ cương lao động được bảo vệ nghiêm minh." }
    },
    {
        id: "Q103",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #103",
        description: "Một cuộc đình công tự phát nổ ra tại khu chế xuất đòi tăng lương và giảm giờ làm. Đề xuất giải quyết: Áp dụng biện pháp hành chính cưỡng chế yêu cầu quay lại làm việc để bảo vệ chuỗi sản xuất và môi trường đầu tư.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Khi có xung đột quan hệ lao động, Nhà nước can thiệp điều hòa thông qua thể chế đại diện (Công đoàn), đặt sự ổn định xã hội và quyền lợi chính đáng của người lao động làm nền tảng.",
            equity: "Khi có xung đột quan hệ lao động, Nhà nước can thiệp điều hòa thông qua thể chế đại diện (Công đoàn), đặt sự ổn định xã hội và quyền lợi chính đáng của người lao động làm nền tảng.",
            discipline: "Khi có xung đột quan hệ lao động, Nhà nước can thiệp điều hòa thông qua thể chế đại diện (Công đoàn), đặt sự ổn định xã hội và quyền lợi chính đáng của người lao động làm nền tảng."
        },
        onApprove: { market: 20, equity: -30, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Trật tự tại khu chế xuất được lập lại nhanh chóng bằng lệnh hành chính cưỡng chế để bảo vệ chuỗi cung ứng. Dẫu vậy, sự bức xúc của công nhân vẫn âm ỉ." },
        onReject: { market: -15, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Đình công tự phát kết thúc êm đẹp sau khi cơ quan chức năng hỗ trợ Công đoàn và Doanh nghiệp đối thoại tăng phúc lợi. Trật tự xã hội được giữ vững bền vững." }
    },
    {
        id: "Q104",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #104",
        description: "Hiệp hội người sử dụng lao động đề xuất kìm giữ mức lương tối thiểu vùng trong 3 năm liên tiếp để hỗ trợ doanh nghiệp phục hồi sau khủng hoảng. Đề xuất giải quyết: Đồng ý tạm dừng tăng lương tối thiểu để giúp doanh nghiệp giảm chi phí, duy trì số lượng việc làm hiện có.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Tiền lương tối thiểu phản ánh chi phí tái sản xuất sức lao động tối thiểu. Nhà nước bảo vệ mức sàn này để ngăn ngừa tình trạng bóc lột sức lao động quá mức dưới áp lực thị trường.",
            equity: "Tiền lương tối thiểu phản ánh chi phí tái sản xuất sức lao động tối thiểu. Nhà nước bảo vệ mức sàn này để ngăn ngừa tình trạng bóc lột sức lao động quá mức dưới áp lực thị trường.",
            discipline: "Tiền lương tối thiểu phản ánh chi phí tái sản xuất sức lao động tối thiểu. Nhà nước bảo vệ mức sàn này để ngăn ngừa tình trạng bóc lột sức lao động quá mức dưới áp lực thị trường."
        },
        onApprove: { market: 25, equity: -30, discipline: -10, headline: "BÁO CHÍ ĐƯA TIN: Quyết định hoãn tăng lương tối thiểu giúp giới chủ doanh nghiệp giảm gánh nặng chi phí. Dù vậy, đời sống công nhân nghèo lâm vào cảnh chật vật do bão giá." },
        onReject: { market: -20, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Lương tối thiểu vùng chính thức được điều chỉnh tăng theo chỉ số CPI. Người lao động phân khởi, mặc dù một số doanh nghiệp nhỏ phải đau đầu tinh giản nhân sự." }
    },
    {
        id: "Q106",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #106",
        description: "Tại một Tổng công ty Nhà nước, doanh thu tăng vọt nhờ bối cảnh thị trường thuận lợi chứ không phải do tăng năng suất. Đề xuất giải quyết: Phân phối chủ yếu theo mức độ đóng góp lao động thực tế của từng cá nhân, phần dư dồn vào quỹ đầu tư phát triển.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Phân phối trong KTTT định hướng XHCN lấy phân phối theo kết quả lao động và hiệu quả kinh tế làm chủ đạo, tránh bình quân cào bằng làm triệt tiêu động lực lao động.",
            equity: "Phân phối trong KTTT định hướng XHCN lấy phân phối theo kết quả lao động và hiệu quả kinh tế làm chủ đạo, tránh bình quân cào bằng làm triệt tiêu động lực lao động.",
            discipline: "Phân phối trong KTTT định hướng XHCN lấy phân phối theo kết quả lao động và hiệu quả kinh tế làm chủ đạo, tránh bình quân cào bằng làm triệt tiêu động lực lao động."
        },
        onApprove: { market: 20, equity: -10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Tổng công ty áp dụng trả thưởng bám sát năng suất lao động và mức đóng góp thực tế. Công nhân thi đua sôi nổi, năng lực sản xuất của doanh nghiệp tăng vọt." },
        onReject: { market: -25, equity: 20, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Cơ chế thưởng cào bằng tại Tổng công ty Nhà nước được thông qua. Triệt tiêu động lực phấn đấu của lao động trình độ cao, hiệu quả kinh doanh có dấu hiệu sụt giảm." }
    },
    {
        id: "Q108",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #108",
        description: "Khi cổ phần hóa một Doanh nghiệp Nhà nước yếu kém, nhà đầu tư tư nhân cam kết mua lại giá cao nhưng yêu cầu sa thải ngay 60% lao động dôi dào. Đề xuất giải quyết: Chấp nhận cắt giảm lao động (có đền bù) để xử lý nhanh cục diện thua lỗ và thu hồi vốn nhà nước.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Cổ phần hóa DNNN không đơn thuần là tối ưu hóa vốn mà phải giải quyết hài hòa mối quan hệ giữa hiệu quả kinh tế và trách nhiệm an sinh xã hội đối với người lao động.",
            equity: "Cổ phần hóa DNNN không đơn thuần là tối ưu hóa vốn mà phải giải quyết hài hòa mối quan hệ giữa hiệu quả kinh tế và trách nhiệm an sinh xã hội đối với người lao động.",
            discipline: "Cổ phần hóa DNNN không đơn thuần là tối ưu hóa vốn mà phải giải quyết hài hòa mối quan hệ giữa hiệu quả kinh tế và trách nhiệm an sinh xã hội đối với người lao động."
        },
        onApprove: { market: 25, equity: -30, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Doanh nghiệp cổ phần hóa hoàn tất nhanh chóng sau khi sa thải 60% lao động dôi dư. Vốn nhà nước được thu hồi hiệu quả, nhưng hàng trăm công nhân mất việc." },
        onReject: { market: -20, equity: 20, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Tiến độ cổ phần hóa DNNN bị chậm lại do nhà đầu tư phải đào tạo lại nghề và sử dụng lao động dôi dư. Tuy nhiên, an sinh xã hội tại địa phương được giữ vững ổn định." }
    },
    {
        id: "Q109",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #109",
        description: "Để thu hút lao động chất lượng cao về vùng khó khăn, địa phương nên dùng chính sách đãi ngộ nào? Đề xuất giải quyết: Trả mức lương/thưởng rất cao từ ngân sách cho các chuyên gia giỏi, bất kể mặt bằng lương chung của cán bộ địa phương.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Bên cạnh đòn bẩy thu nhập, Nhà nước cần tạo lập môi trường và điều kiện tiếp cận dịch vụ xã hội cơ bản bình đẳng để giữ chân và tái sản xuất sức lao động lâu dài.",
            equity: "Bên cạnh đòn bẩy thu nhập, Nhà nước cần tạo lập môi trường và điều kiện tiếp cận dịch vụ xã hội cơ bản bình đẳng để giữ chân và tái sản xuất sức lao động lâu dài.",
            discipline: "Bên cạnh đòn bẩy thu nhập, Nhà nước cần tạo lập môi trường và điều kiện tiếp cận dịch vụ xã hội cơ bản bình đẳng để giữ chân và tái sản xuất sức lao động lâu dài."
        },
        onApprove: { market: 20, equity: -15, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Chính sách lương thưởng khủng thu hút được chuyên gia giỏi về vùng khó khăn. Tuy nhiên, ngân sách địa phương bị thâm hụt và gây ra sự tị nạnh nội bộ cán bộ." },
        onReject: { market: -10, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Hạ tầng y tế, giáo dục và nhà ở công vụ đồng bộ tại vùng khó khăn khánh thành. Người lao động trẻ yên tâm cống hiến lâu dài, an sinh xã hội tăng vọt." }
    },
    {
        id: "Q111",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #111",
        description: "Trong một tỉnh nghèo, người dân bản địa thiếu kỹ năng lao động công nghiệp, nguy cơ bị các nhà đầu tư bên ngoài chiếm mất cơ hội việc làm tại chỗ. Đề xuất giải quyết: Cho phép các tập đoàn tự do tuyển dụng lao động chất lượng cao từ nơi khác đến để dự án vận hành nhanh nhất.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Phát triển kinh tế thị trường định hướng XHCN lấy con người làm trung tâm, bảo đảm người dân địa phương được tham gia và thụ hưởng trực tiếp từ quá trình công nghiệp hóa.",
            equity: "Phát triển kinh tế thị trường định hướng XHCN lấy con người làm trung tâm, bảo đảm người dân địa phương được tham gia và thụ hưởng trực tiếp từ quá trình công nghiệp hóa.",
            discipline: "Phát triển kinh tế thị trường định hướng XHCN lấy con người làm trung tâm, bảo đảm người dân địa phương được tham gia và thụ hưởng trực tiếp từ quá trình công nghiệp hóa."
        },
        onApprove: { market: 25, equity: -30, discipline: -10, headline: "BÁO CHÍ ĐƯA TIN: Tập đoàn công nghiệp tự do tuyển dụng 100% lao động ngoại tỉnh để vận hành dự án nhanh nhất. Người dân địa phương thất vọng vì mất cơ hội việc làm tại chỗ." },
        onReject: { market: -15, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Áp dụng quy định buộc doanh nghiệp dành tối thiểu 50% việc làm và đào tạo cho người bản địa. Tăng trưởng chậm lại một chút nhưng an sinh địa phương vững chắc." }
    },
    {
        id: "Q113",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #113",
        description: "Đơn hàng tăng vọt, doanh nghiệp ép công nhân làm thêm giờ vượt quá quy định pháp luật. Công nhân tự phát đình công. Đề xuất giải quyết: Can thiệp để hòa giải, bắt buộc doanh nghiệp tuân thủ quy định pháp lý và bảo vệ quyền lợi của người lao động.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Mục 5.3 khẳng định giải quyết mâu thuẫn cần sự tham gia của nhà nước, có hòa giải và tuân thủ pháp luật (Lựa chọn 1). Bỏ mặc cho thị trường (Lựa chọn 2) là từ bỏ vai trò quản lý, làm tổn hại lợi ích chính đáng của người lao động.",
            equity: "Mục 5.3 khẳng định giải quyết mâu thuẫn cần sự tham gia của nhà nước, có hòa giải và tuân thủ pháp luật (Lựa chọn 1). Bỏ mặc cho thị trường (Lựa chọn 2) là từ bỏ vai trò quản lý, làm tổn hại lợi ích chính đáng của người lao động.",
            discipline: "Mục 5.3 khẳng định giải quyết mâu thuẫn cần sự tham gia của nhà nước, có hòa giải và tuân thủ pháp luật (Lựa chọn 1). Bỏ mặc cho thị trường (Lựa chọn 2) là từ bỏ vai trò quản lý, làm tổn hại lợi ích chính đáng của người lao động."
        },
        onApprove: { market: -15, equity: 20, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Đình công chấm dứt sau khi cơ quan chức năng can thiệp buộc doanh nghiệp tuân thủ quy định pháp luật về giờ làm thêm và bồi thường cho công nhân." },
        onReject: { market: 25, equity: -30, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Vụ việc đình công kéo dài do chính quyền bỏ mặc tự điều tiết theo thị trường. Sản xuất của doanh nghiệp tê liệt, an ninh trật tự xã hội bị ảnh hưởng xấu." }
    },
    {
        id: "Q114",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #114",
        description: "Một doanh nghiệp FDI lớn dọa rút vốn sang nước khác nếu chính quyền địa phương không hạn chế hoạt động của tổ chức công đoàn cơ sở. Đề xuất giải quyết: Chấp thuận ngầm giới hạn quyền hoạt động của công đoàn để giữ chân dòng vốn tỷ đô và bảo đảm tăng trưởng GDP cho địa phương.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Theo Mục 5.3, người lao động cần lập công đoàn để bảo vệ quyền lợi. Nhà nước có trách nhiệm bảo đảm hài hòa lợi ích, không thể đánh đổi lợi ích chính đáng và luật pháp (Kỷ cương) chỉ vì tăng trưởng kinh tế đơn thuần (Lựa chọn 1).",
            equity: "Theo Mục 5.3, người lao động cần lập công đoàn để bảo vệ quyền lợi. Nhà nước có trách nhiệm bảo đảm hài hòa lợi ích, không thể đánh đổi lợi ích chính đáng và luật pháp (Kỷ cương) chỉ vì tăng trưởng kinh tế đơn thuần (Lựa chọn 1).",
            discipline: "Theo Mục 5.3, người lao động cần lập công đoàn để bảo vệ quyền lợi. Nhà nước có trách nhiệm bảo đảm hài hòa lợi ích, không thể đánh đổi lợi ích chính đáng và luật pháp (Kỷ cương) chỉ vì tăng trưởng kinh tế đơn thuần (Lựa chọn 1)."
        },
        onApprove: { market: 25, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Doanh nghiệp FDI lớn quyết định giữ vốn sau khi chính quyền ngầm giới hạn quyền hoạt động của công đoàn. Dẫu vậy, quyền lợi của công nhân bị bỏ ngỏ." },
        onReject: { market: -10, equity: 20, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Chính quyền kiên quyết bảo vệ quyền lập công đoàn của người lao động. Nhà đầu tư FDI rút vốn sang nước khác, kinh tế địa phương lâm vào cảnh khó khăn." }
    },
    {
        id: "Q116",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #116",
        description: "Phát hiện một nhóm cán bộ dự án và nhà thầu móc ngoặc để bớt xén quỹ phúc lợi, an toàn lao động của công nhân. Đề xuất giải quyết: Khởi tố và xử lý nghiêm minh theo pháp luật, thu hồi tài sản bị chiếm đoạt để hoàn trả cho quỹ phúc lợi của công nhân.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Mục 5.3 nhấn mạnh việc chống 'lợi ích nhóm' tiêu cực và thu nhập bất hợp pháp phải được thực hiện quyết liệt bằng pháp luật để bảo vệ lợi ích xã hội (Lựa chọn 1). Bao che (Lựa chọn 2) làm suy yếu kỷ cương.",
            equity: "Mục 5.3 nhấn mạnh việc chống 'lợi ích nhóm' tiêu cực và thu nhập bất hợp pháp phải được thực hiện quyết liệt bằng pháp luật để bảo vệ lợi ích xã hội (Lựa chọn 1). Bao che (Lựa chọn 2) làm suy yếu kỷ cương.",
            discipline: "Mục 5.3 nhấn mạnh việc chống 'lợi ích nhóm' tiêu cực và thu nhập bất hợp pháp phải được thực hiện quyết liệt bằng pháp luật để bảo vệ lợi ích xã hội (Lựa chọn 1). Bao che (Lựa chọn 2) làm suy yếu kỷ cương."
        },
        onApprove: { market: -10, equity: 25, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Khởi tố vụ án bớt xén quỹ phúc lợi, thu hồi triệt để tài sản hoàn trả cho công nhân. Kỷ cương pháp luật được thực thi nghiêm minh, người dân nức lòng đồng thuận." },
        onReject: { market: 20, equity: -25, discipline: -30, headline: "BÁO CHÍ ĐƯA TIN: Vụ việc bớt xén quỹ phúc lợi chỉ bị xử lý nội bộ nhẹ nhàng để giữ hình ảnh thu hút vốn đầu tư. Kỷ cương lỏng lẻo làm niềm tin của người lao động sụt giảm." }
    },
    {
        id: "Q117",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #117",
        description: "Nhiều người lao động muốn rút bảo hiểm xã hội (BHXH) một lần để lấy tiền kinh doanh tự do thay vì chờ lương hưu. Đề xuất giải quyết: Khuyến khích người dân tự do rút bảo hiểm một lần để có vốn khởi nghiệp, nới lỏng dòng tiền và kích thích thị trường tự do.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Mục 5.1 và 5.3 quy định nền kinh tế định hướng XHCN thực hiện phân phối qua hệ thống an sinh xã hội. Khuyến khích rút BHXH (Lựa chọn 1) tạo rủi ro nghèo đói dài hạn, đi ngược mục tiêu tiến bộ và công bằng xã hội.",
            equity: "Mục 5.1 và 5.3 quy định nền kinh tế định hướng XHCN thực hiện phân phối qua hệ thống an sinh xã hội. Khuyến khích rút BHXH (Lựa chọn 1) tạo rủi ro nghèo đói dài hạn, đi ngược mục tiêu tiến bộ và công bằng xã hội.",
            discipline: "Mục 5.1 và 5.3 quy định nền kinh tế định hướng XHCN thực hiện phân phối qua hệ thống an sinh xã hội. Khuyến khích rút BHXH (Lựa chọn 1) tạo rủi ro nghèo đói dài hạn, đi ngược mục tiêu tiến bộ và công bằng xã hội."
        },
        onApprove: { market: 30, equity: -30, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Làn sóng rút bảo hiểm xã hội một lần tăng đột biến, đưa dòng tiền tự do lớn vào thị trường. Tuy nhiên, nguy cơ nghèo đói khi tuổi già gõ cửa gia tăng nhanh chóng." },
        onReject: { market: -10, equity: 25, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Chính sách hạn chế rút BHXH một lần kết hợp gói vay nhỏ ưu đãi phát huy tác dụng. Mạng lưới an sinh xã hội quốc gia được bảo đảm ổn định bền vững." }
    },
    {
        id: "Q118",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #118",
        description: "Doanh nghiệp muốn nâng cao năng suất nhưng chi phí lao động đang cao. Ban giám đốc tranh luận về cách tối ưu chi phí. Đề xuất giải quyết: Giữ nguyên phúc lợi cơ bản, áp dụng cơ chế chia sẻ một phần lợi nhuận (thưởng năng suất) để kích thích công nhân phát huy sáng kiến kỹ thuật.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Theo Mục 5.3, sự thống nhất lợi ích thể hiện ở việc chia sẻ kết quả, tạo động lực (Lựa chọn 1). Cắt xén phúc lợi thiết yếu (Lựa chọn 2) làm bùng phát mâu thuẫn, gây tổn hại đến tái sản xuất sức lao động.",
            equity: "Theo Mục 5.3, sự thống nhất lợi ích thể hiện ở việc chia sẻ kết quả, tạo động lực (Lựa chọn 1). Cắt xén phúc lợi thiết yếu (Lựa chọn 2) làm bùng phát mâu thuẫn, gây tổn hại đến tái sản xuất sức lao động.",
            discipline: "Theo Mục 5.3, sự thống nhất lợi ích thể hiện ở việc chia sẻ kết quả, tạo động lực (Lựa chọn 1). Cắt xén phúc lợi thiết yếu (Lựa chọn 2) làm bùng phát mâu thuẫn, gây tổn hại đến tái sản xuất sức lao động."
        },
        onApprove: { market: 15, equity: 15, discipline: -10, headline: "BÁO CHÍ ĐƯA TIN: Doanh nghiệp áp dụng cơ chế thưởng năng suất kết hợp giữ nguyên phúc lợi. Công nhân thi đua sáng tạo kỹ thuật, giúp nhà máy đạt hiệu quả sản xuất kỷ lục." },
        onReject: { market: 25, equity: -30, discipline: -10, headline: "BÁO CHÍ ĐƯA TIN: Việc cắt sạch phúc lợi phụ để dồn tiền mua robot tự động hóa vấp phải sự lãn công phản kháng mạnh mẽ của công nhân. Nhà máy đối mặt nguy cơ đình trệ." }
    },
    {
        id: "Q119",
        title: "Quan hệ lao động và Việc làm — Hồ sơ #119",
        description: "Tự động hóa khiến một lượng lớn công nhân ngành dệt may mất việc. Chính quyền cần tìm giải pháp lâu dài. Đề xuất giải quyết: Ra luật cấm các doanh nghiệp dệt may áp dụng người máy tự động hóa trong 5 năm tới để bảo vệ tuyệt đối việc làm thủ công cho công nhân.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Mục 5.2 và 5.3 nhấn mạnh tôn trọng nguyên tắc thị trường, nhà nước hỗ trợ phân phối đầu vào (tiếp cận cơ hội, đào tạo). Cấm ứng dụng công nghệ (Lựa chọn 1) là cản trở sự phát triển của LLSX, đi ngược với tiến trình khách quan.",
            equity: "Mục 5.2 và 5.3 nhấn mạnh tôn trọng nguyên tắc thị trường, nhà nước hỗ trợ phân phối đầu vào (tiếp cận cơ hội, đào tạo). Cấm ứng dụng công nghệ (Lựa chọn 1) là cản trở sự phát triển của LLSX, đi ngược với tiến trình khách quan.",
            discipline: "Mục 5.2 và 5.3 nhấn mạnh tôn trọng nguyên tắc thị trường, nhà nước hỗ trợ phân phối đầu vào (tiếp cận cơ hội, đào tạo). Cấm ứng dụng công nghệ (Lựa chọn 1) là cản trở sự phát triển của LLSX, đi ngược với tiến trình khách quan."
        },
        onApprove: { market: -30, equity: 20, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Đạo luật cấm tự động hóa ngành dệt may giúp bảo toàn việc làm trước mắt cho công nhân dệt. Nhưng năng suất ngành sụt giảm nghiêm trọng, mất sức cạnh tranh." },
        onReject: { market: 15, equity: 20, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Hàng ngàn công nhân dệt dôi dư do robot hóa được hỗ trợ kinh phí đào tạo lại nghề, chuyển sang dịch vụ mới. Năng suất lao động nâng cao vượt bậc." }
    },
    {
        id: "Q201",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #201",
        description: "Một doanh nghiệp đề xuất cơ chế trả lương cào bằng cho tất cả nhân viên bất kể năng suất để đảm bảo sự đoàn kết tuyệt đối. Đề xuất giải quyết: Phân phối theo kết quả lao động và hiệu quả kinh tế để tạo động lực.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Trong kinh tế thị trường định hướng XHCN, phân phối kết quả làm ra chủ yếu thực hiện theo kết quả lao động, hiệu quả kinh tế để tạo động lực phát triển.",
            equity: "Trong kinh tế thị trường định hướng XHCN, phân phối kết quả làm ra chủ yếu thực hiện theo kết quả lao động, hiệu quả kinh tế để tạo động lực phát triển.",
            discipline: "Trong kinh tế thị trường định hướng XHCN, phân phối kết quả làm ra chủ yếu thực hiện theo kết quả lao động, hiệu quả kinh tế để tạo động lực phát triển."
        },
        onApprove: { market: 10, equity: 0, discipline: 0, headline: "BÁO CHÍ ĐƯA TIN: Áp dụng thành công hệ thống phân phối thu nhập dựa trên hiệu quả lao động. Người làm việc hiệu quả phấn khởi tăng năng suất, thúc đẩy thị trường sôi động." },
        onReject: { market: -30, equity: 20, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Cơ chế lương cào bằng được thông qua để đảm bảo đoàn kết. Triệt tiêu hoàn toàn động lực làm việc của nhân tài, hiệu quả sản xuất kinh doanh sụt sụt giảm." }
    },
    {
        id: "Q203",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #203",
        description: "Một nhóm doanh nghiệp lớn vận động hành lang để ban hành quy định có lợi riêng cho họ nhưng gây thiệt hại cho người tiêu dùng. Đề xuất giải quyết: Ngăn chặn và kiểm soát \"lợi ích nhóm\" tiêu cực bằng pháp luật.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Khi \"lợi ích nhóm\" mâu thuẫn với lợi ích quốc gia, làm tổn hại các lợi ích khác thì cần phải ngăn chặn, đặc biệt là các nhóm có sự tham gia của công quyền.",
            equity: "Khi \"lợi ích nhóm\" mâu thuẫn với lợi ích quốc gia, làm tổn hại các lợi ích khác thì cần phải ngăn chặn, đặc biệt là các nhóm có sự tham gia của công quyền.",
            discipline: "Khi \"lợi ích nhóm\" mâu thuẫn với lợi ích quốc gia, làm tổn hại các lợi ích khác thì cần phải ngăn chặn, đặc biệt là các nhóm có sự tham gia của công quyền."
        },
        onApprove: { market: -15, equity: 15, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Kiên quyết ngăn chặn luật đặc thù ưu ái lợi ích nhóm doanh nghiệp lớn. Môi trường cạnh tranh bình đẳng được giữ vững, bảo vệ quyền lợi người tiêu dùng." },
        onReject: { market: 20, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Thông qua quy định có lợi riêng cho các tập đoàn lớn thân hữu để kéo GDP. Độc quyền nhóm xuất hiện bóp nghẹt các doanh nghiệp nhỏ, gây bức xúc dư luận." }
    },
    {
        id: "Q205",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #205",
        description: "Khi xây dựng thể chế về sở hữu, bạn sẽ ưu tiên bảo vệ quyền tài sản của ai để thúc đẩy kinh tế? Đề xuất giải quyết: Chỉ tập trung bảo vệ tài sản nhà nước.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Hoàn thiện thể chế về sở hữu yêu cầu thể chế hóa đầy đủ quyền tài sản của cả Nhà nước, tổ chức và cá nhân để các quyền này được giao dịch thông suốt và bảo vệ hiệu quả.",
            equity: "Hoàn thiện thể chế về sở hữu yêu cầu thể chế hóa đầy đủ quyền tài sản của cả Nhà nước, tổ chức và cá nhân để các quyền này được giao dịch thông suốt và bảo vệ hiệu quả.",
            discipline: "Hoàn thiện thể chế về sở hữu yêu cầu thể chế hóa đầy đủ quyền tài sản của cả Nhà nước, tổ chức và cá nhân để các quyền này được giao dịch thông suốt và bảo vệ hiệu quả."
        },
        onApprove: { market: -25, equity: 10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Thể chế chỉ bảo vệ tài sản công khiến nhà đầu tư e ngại, thị trường tài sản tư nhân rơi vào đóng băng, kìm hãm dòng vốn đầu tư trong nước." },
        onReject: { market: 20, equity: 10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Luật thể chế hóa đầy đủ quyền tài sản của cá nhân và tổ chức đi vào cuộc sống. Khơi thông các giao dịch tài sản, dòng vốn tư nhân bùng nổ mạnh mẽ." }
    },
    {
        id: "Q207",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #207",
        description: "Trong một dự án đầu tư công, có ý kiến cho rằng cần ưu tiên tuyệt đối cho doanh nghiệp nhà nước (DNNN) bất kể năng lực cạnh tranh. Đề xuất giải quyết: Ưu tiên tuyệt đối cho DNNN để giữ vai trò chủ đạo.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Hoàn thiện thể chế yêu cầu các doanh nghiệp thuộc mọi thành phần kinh tế đều bình đẳng trước pháp luật, cạnh tranh lành mạnh và DNNN chỉ tập trung vào lĩnh vực then chốt.",
            equity: "Hoàn thiện thể chế yêu cầu các doanh nghiệp thuộc mọi thành phần kinh tế đều bình đẳng trước pháp luật, cạnh tranh lành mạnh và DNNN chỉ tập trung vào lĩnh vực then chốt.",
            discipline: "Hoàn thiện thể chế yêu cầu các doanh nghiệp thuộc mọi thành phần kinh tế đều bình đẳng trước pháp luật, cạnh tranh lành mạnh và DNNN chỉ tập trung vào lĩnh vực then chốt."
        },
        onApprove: { market: -20, equity: 10, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Thể chế tiếp tục ưu ái giao dự án béo bở cho DNNN bất kể năng lực. Gây ra tình trạng độc quyền, trì trệ và làm nản lòng các nhà đầu tư tư nhân thực." },
        onReject: { market: 25, equity: 10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Áp dụng nhất quán chế độ pháp lý bình đẳng cho mọi thành phần kinh tế. Kích thích các doanh nghiệp tư nhân cạnh tranh sòng phẳng, thúc đẩy tăng trưởng hiệu quả." }
    },
    {
        id: "Q209",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #209",
        description: "Bạn đứng trước quyết định điều chỉnh chính sách thuế thu nhập cá nhân để hỗ trợ người nghèo nhưng có thể làm giảm tích lũy của người giàu. Đề xuất giải quyết: Hủy bỏ hoặc giảm tối đa thuế thu nhập cá nhân để kích thích đầu tư tối đa.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Chính sách phân phối thu nhập của nhà nước, bao gồm cả thuế, có vai trò điều hòa lợi ích và giảm bớt sự phân hóa giàu nghèo thái quá.",
            equity: "Chính sách phân phối thu nhập của nhà nước, bao gồm cả thuế, có vai trò điều hòa lợi ích và giảm bớt sự phân hóa giàu nghèo thái quá.",
            discipline: "Chính sách phân phối thu nhập của nhà nước, bao gồm cả thuế, có vai trò điều hòa lợi ích và giảm bớt sự phân hóa giàu nghèo thái quá."
        },
        onApprove: { market: 30, equity: -25, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Bãi bỏ thuế thu nhập giúp kích thích dòng vốn đầu tư lớn của giới siêu giàu. Tuy nhiên, bất bình đẳng xã hội gia tăng và ngân sách phúc lợi bị thu hẹp." },
        onReject: { market: -20, equity: 25, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Sử dụng thuế thu nhập lũy tiến làm công cụ điều tiết hài hòa lợi ích xã hội. Ngân sách an sinh được bổ sung dồi dào để hỗ trợ người nghèo vượt khó." }
    },
    {
        id: "Q211",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #211",
        description: "Có ý kiến cho rằng lợi ích cá nhân là ích kỷ và cần bị triệt tiêu hoàn toàn để phục vụ lợi ích tập thể. Đề xuất giải quyết: Đồng ý, cần triệt tiêu lợi ích cá nhân để phục vụ lợi ích tập thể làm duy nhất.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Lợi ích cá nhân là nền tảng, là động lực trực tiếp thúc đẩy con người lao động, sáng tạo và đóng góp vào sự phát triển chung của xã hội.",
            equity: "Lợi ích cá nhân là nền tảng, là động lực trực tiếp thúc đẩy con người lao động, sáng tạo và đóng góp vào sự phát triển chung của xã hội.",
            discipline: "Lợi ích cá nhân là nền tảng, là động lực trực tiếp thúc đẩy con người lao động, sáng tạo và đóng góp vào sự phát triển chung của xã hội."
        },
        onApprove: { market: -30, equity: 10, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Áp dụng chiến dịch triệt tiêu lợi ích cá nhân để phục vụ tuyệt đối cho tập thể. Triệt tiêu hoàn toàn sức sáng tạo và tinh thần lao động, kinh tế lâm vào đình trệ." },
        onReject: { market: 25, equity: 15, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Thể chế bảo vệ và tôn trọng lợi ích cá nhân chính đáng đi vào cuộc sống. Kích thích mạnh mẽ sức sản xuất và tinh thần khởi nghiệp làm giàu trong nhân dân." }
    },
    {
        id: "Q213",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #213",
        description: "Nền kinh tế đang tăng trưởng tốt nhưng có biểu hiện tập trung thu nhập vào một nhóm nhỏ chủ sở hữu tư bản, trong khi đời sống người lao động chậm cải thiện. Đề xuất giải quyết: Giữ nguyên cơ chế hiện tại để bảo vệ lợi nhuận doanh nghiệp, thúc đẩy tích lũy tư bản cho đầu tư lớn.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Kinh tế thị trường định hướng XHCN yêu cầu gắn tăng trưởng kinh tế với công bằng xã hội ngay trong từng chính sách, không đợi kinh tế phát triển cao mới thực hiện công bằng.",
            equity: "Kinh tế thị trường định hướng XHCN yêu cầu gắn tăng trưởng kinh tế với công bằng xã hội ngay trong từng chính sách, không đợi kinh tế phát triển cao mới thực hiện công bằng.",
            discipline: "Kinh tế thị trường định hướng XHCN yêu cầu gắn tăng trưởng kinh tế với công bằng xã hội ngay trong từng chính sách, không đợi kinh tế phát triển cao mới thực hiện công bằng."
        },
        onApprove: { market: 20, equity: -25, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Kinh tế tăng trưởng tốt nhưng lợi ích tập trung vào tay một nhóm nhỏ chủ tư bản. Đời sống người lao động chậm cải thiện, bất bình đẳng nới rộng sâu sắc." },
        onReject: { market: -15, equity: 25, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Phân phối lại thu nhập qua thuế lũy tiến và tăng chi cho an sinh xã hội. Khoảng cách giàu nghèo được kiểm soát, bảo đảm công bằng và tiến bộ xã hội." }
    },
    {
        id: "Q215",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #215",
        description: "Quan hệ giữa người lao động và chủ doanh nghiệp tại một khu công nghiệp đang căng thẳng do tranh chấp về tiền lương tối thiểu. Đề xuất giải quyết: Để thị trường tự quyết định tiền lương dựa trên quan hệ cung - cầu lao động mà không có sự can thiệp của Nhà nước.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Nhà nước cần can thiệp vào quan hệ lợi ích giữa người lao động và người sử dụng lao động để bảo vệ lợi ích hợp pháp của người lao động và đảm bảo hài hòa lợi ích.",
            equity: "Nhà nước cần can thiệp vào quan hệ lợi ích giữa người lao động và người sử dụng lao động để bảo vệ lợi ích hợp pháp của người lao động và đảm bảo hài hòa lợi ích.",
            discipline: "Nhà nước cần can thiệp vào quan hệ lợi ích giữa người lao động và người sử dụng lao động để bảo vệ lợi ích hợp pháp của người lao động và đảm bảo hài hòa lợi ích."
        },
        onApprove: { market: 25, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Thị trường tự do định đoạt tiền lương khiến giá nhân công sụt giảm nghiêm trọng tại các vùng dư cung lao động. Đời sống người lao động nghèo bị bóc lột kiệt quệ." },
        onReject: { market: -10, equity: 20, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Mức lương tối thiểu vùng được Nhà nước điều chỉnh kịp thời. Sức mua của người lao động được bảo toàn, ngăn ngừa hiệu quả các xung đột xã hội gay gắt." }
    },
    {
        id: "Q216",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #216",
        description: "Xuất hiện hiện tượng một số cá nhân giàu lên nhanh chóng nhờ các hoạt động đầu cơ đất đai và trốn thuế, gây bất bình trong xã hội. Đề xuất giải quyết: Tăng cường kiểm soát thu nhập của công dân và siết chặt kỷ luật tài chính để ngăn chặn các nguồn thu bất hợp pháp.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước phải kiểm soát thu nhập và ngăn chặn các hoạt động bất hợp pháp như trốn thuế, đầu cơ để bảo vệ các chủ thể làm ăn chân chính.",
            equity: "Nhà nước phải kiểm soát thu nhập và ngăn chặn các hoạt động bất hợp pháp như trốn thuế, đầu cơ để bảo vệ các chủ thể làm ăn chân chính.",
            discipline: "Nhà nước phải kiểm soát thu nhập và ngăn chặn các hoạt động bất hợp pháp như trốn thuế, đầu cơ để bảo vệ các chủ thể làm ăn chân chính."
        },
        onApprove: { market: -15, equity: 20, discipline: 30, headline: "BÁO CHÍ ĐƯA TIN: Chiến dịch siết chặt kỷ luật tài chính và kiểm soát thu nhập bất hợp pháp ra quân quyết liệt. Các hoạt động trốn thuế, đầu cơ đất đai bị đẩy lùi, kỷ cương nghiêm minh." },
        onReject: { market: 25, equity: -20, discipline: -25, headline: "BÁO CHÍ ĐƯA TIN: Quản lý lỏng lẻo tạo điều kiện cho các dòng tiền đầu cơ đất đai nhảy múa tự do. Thị trường sốt ảo, bất bình đẳng xã hội gia tăng và kỷ cương bị buông lỏng." }
    },
    {
        id: "Q218",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #218",
        description: "Bạn cần điều chỉnh cơ cấu phân phối thu nhập để tạo động lực cho các nhà khoa học và kỹ sư có trình độ cao. Đề xuất giải quyết: Đẩy mạnh phân phối theo lao động và hiệu quả kinh tế, trả lương cao cho lao động trí tuệ và sáng tạo.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Trong kinh tế thị trường định hướng XHCN, phân phối theo lao động và hiệu quả kinh tế là hình thức phân phối chủ đạo để tạo động lực.",
            equity: "Trong kinh tế thị trường định hướng XHCN, phân phối theo lao động và hiệu quả kinh tế là hình thức phân phối chủ đạo để tạo động lực.",
            discipline: "Trong kinh tế thị trường định hướng XHCN, phân phối theo lao động và hiệu quả kinh tế là hình thức phân phối chủ đạo để tạo động lực."
        },
        onApprove: { market: 25, equity: -15, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Chính sách trả lương vượt trội cho chuyên gia và nhà sáng chế được áp dụng. Làn sóng đổi mới công nghệ bùng nổ, nâng cao năng lực cạnh tranh quốc gia." },
        onReject: { market: -25, equity: 15, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Áp đặt mức trần lương đối với lao động trình độ cao bằng mệnh lệnh hành chính. Hiện tượng chảy máu chất xám nghiêm trọng xảy ra, triệt tiêu động lực đổi mới." }
    },
    {
        id: "Q220",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #220",
        description: "Nền kinh tế đang gặp khó khăn, ngân sách hạn hẹp. Có ý kiến đề nghị cắt giảm toàn bộ quỹ phúc lợi và trợ cấp thất nghiệp để dồn lực hỗ trợ doanh nghiệp. Đề xuất giải quyết: Cắt giảm an sinh xã hội để tối đa hóa nguồn lực cho sản xuất, coi đó là cái giá phải trả cho tăng trưởng.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Chính sách xã hội phải nhằm tạo động lực thúc đẩy tăng trưởng kinh tế và coi đầu tư cho xã hội là đầu tư cho sự phát triển bền vững.",
            equity: "Chính sách xã hội phải nhằm tạo động lực thúc đẩy tăng trưởng kinh tế và coi đầu tư cho xã hội là đầu tư cho sự phát triển bền vững.",
            discipline: "Chính sách xã hội phải nhằm tạo động lực thúc đẩy tăng trưởng kinh tế và coi đầu tư cho xã hội là đầu tư cho sự phát triển bền vững."
        },
        onApprove: { market: 25, equity: -30, discipline: -10, headline: "BÁO CHÍ ĐƯA TIN: Cắt giảm chi ngân sách an sinh xã hội để dồn lực hỗ trợ doanh nghiệp. Doanh nghiệp phục hồi nhanh nhưng hàng ngàn hộ nghèo rơi vào cảnh túng quẫn, bất ổn gia tăng." },
        onReject: { market: -10, equity: 25, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Giữ vững ngân sách an sinh xã hội giúp duy trì sự ổn định đời sống của người lao động trong khủng hoảng. Tạo tiền đề vững chắc để kinh tế phục hồi bền vững." }
    },
    {
        id: "Q221",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #221",
        description: "Một ngành công nghiệp then chốt do doanh nghiệp nhà nước nắm giữ đang có tỷ suất lợi nhuận thấp nhưng đóng vai trò quan trọng trong việc cung cấp đầu vào rẻ cho người dân. Đề xuất giải quyết: Tiếp tục duy trì để thực hiện điều tiết vĩ mô và hỗ trợ nhóm yếu thế, dù chấp nhận hiệu quả kinh tế thấp của riêng doanh nghiệp đó.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Kinh tế nhà nước phải là công cụ để Nhà nước điều tiết nền kinh tế và hỗ trợ các nhóm dân cư thu nhập thấp.",
            equity: "Kinh tế nhà nước phải là công cụ để Nhà nước điều tiết nền kinh tế và hỗ trợ các nhóm dân cư thu nhập thấp.",
            discipline: "Kinh tế nhà nước phải là công cụ để Nhà nước điều tiết nền kinh tế và hỗ trợ các nhóm dân cư thu nhập thấp."
        },
        onApprove: { market: -15, equity: 20, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Nhà nước duy trì bù giá năng lượng và điện nước qua các DNNN chủ đạo. Chi phí đầu vào của người dân được giữ ổn định, hỗ trợ an sinh tốt." },
        onReject: { market: 25, equity: -25, discipline: -10, headline: "BÁO CHÍ ĐƯA TIN: Giá năng lượng tăng vọt theo mặt bằng thế giới để DNNN tối đa hóa lợi nhuận. Chi phí sinh hoạt leo thang, đe dọa trực tiếp đời sống người lao động nghèo." }
    },
    {
        id: "Q222",
        title: "Phân phối thu nhập và Công bằng xã hội — Hồ sơ #222",
        description: "Trong quá trình hội nhập quốc tế, các doanh nghiệp nội địa đang bị cạnh tranh gay gắt, dẫn đến nguy cơ công nhân mất việc hàng loạt. Đề xuất giải quyết: Đẩy mạnh đào tạo lại nguồn nhân lực và hỗ trợ chuyển đổi nghề nghiệp để người lao động không bị bỏ lại phía sau.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Hội nhập quốc tế tác động nhiều chiều, Nhà nước cần có chính sách đào tạo nhân lực và xử lý vướng mắc để bảo đảm lợi ích người lao động.",
            equity: "Hội nhập quốc tế tác động nhiều chiều, Nhà nước cần có chính sách đào tạo nhân lực và xử lý vướng mắc để bảo đảm lợi ích người lao động.",
            discipline: "Hội nhập quốc tế tác động nhiều chiều, Nhà nước cần có chính sách đào tạo nhân lực và xử lý vướng mắc để bảo đảm lợi ích người lao động."
        },
        onApprove: { market: 15, equity: 25, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Chương trình đào tạo lại nguồn nhân lực thích ứng với cam kết FTA được triển khai rộng khắp. Năng suất lao động nâng cao, công nhân tự tin giữ vững việc làm." },
        onReject: { market: -30, equity: 10, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Đóng cửa thị trường để bảo vệ các doanh nghiệp nội địa yếu kém. Nền kinh tế bị cô lập, hàng hóa trong nước tụt hậu về chất lượng và gánh chịu cấm vận thương mại." }
    },
    {
        id: "Q302",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #302",
        description: "Một tập đoàn kinh tế nhà nước đang hoạt động kém hiệu quả ở một ngành hàng tiêu dùng mà các doanh nghiệp tư nhân đang làm rất tốt. Đề xuất giải quyết: Tiếp tục rót ngân sách hỗ trợ tập đoàn này để giữ vững \"vai trò chủ đạo\" của kinh tế nhà nước trong mọi lĩnh vực.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Doanh nghiệp nhà nước chỉ tập trung vào các lĩnh vực then chốt, thiết yếu, quốc phòng, an ninh hoặc những nơi thành phần kinh tế khác không đầu tư.",
            equity: "Doanh nghiệp nhà nước chỉ tập trung vào các lĩnh vực then chốt, thiết yếu, quốc phòng, an ninh hoặc những nơi thành phần kinh tế khác không đầu tư.",
            discipline: "Doanh nghiệp nhà nước chỉ tập trung vào các lĩnh vực then chốt, thiết yếu, quốc phòng, an ninh hoặc những nơi thành phần kinh tế khác không đầu tư."
        },
        onApprove: { market: -30, equity: 15, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Tiếp tục dùng tiền ngân sách bù lỗ kéo dài cho tập đoàn kinh tế nhà nước yếu kém. Gây lãng phí nguồn lực quốc gia lớn và kìm hãm cạnh tranh lành mạnh." },
        onReject: { market: 25, equity: -15, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Cơ cấu lại toàn diện DNNN, cổ phần hóa và chỉ tập trung vào các lĩnh vực then chốt. Giải phóng không gian thị trường cho tư nhân phát triển mạnh mẽ." }
    },
    {
        id: "Q304",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #304",
        description: "Địa phương bạn đang có xu hướng ưu ái cấp tài nguyên đất đai và nguồn vốn vay cho các doanh nghiệp nhà nước hơn doanh nghiệp tư nhân, dù hiệu quả sử dụng nguồn lực của các doanh nghiệp nhà nước này đang thấp hơn. Đề xuất giải quyết: Duy trì chính sách ưu tiên này vì kinh tế nhà nước giữ vai trò chủ đạo, cần được tập trung nguồn lực để đảm bảo ổn định an sinh và các mục tiêu chính trị tại địa phương.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Hoàn thiện thể chế về sở hữu và thành phần kinh tế yêu cầu phải thực hiện nhất quán một chế độ pháp lý kinh doanh cho các doanh nghiệp, không phân biệt hình thức sở hữu. Mọi doanh nghiệp đều phải bình đẳng trong tiếp cận các nguồn lực và cạnh tranh theo pháp luật.",
            equity: "Hoàn thiện thể chế về sở hữu và thành phần kinh tế yêu cầu phải thực hiện nhất quán một chế độ pháp lý kinh doanh cho các doanh nghiệp, không phân biệt hình thức sở hữu. Mọi doanh nghiệp đều phải bình đẳng trong tiếp cận các nguồn lực và cạnh tranh theo pháp luật.",
            discipline: "Hoàn thiện thể chế về sở hữu và thành phần kinh tế yêu cầu phải thực hiện nhất quán một chế độ pháp lý kinh doanh cho các doanh nghiệp, không phân biệt hình thức sở hữu. Mọi doanh nghiệp đều phải bình đẳng trong tiếp cận các nguồn lực và cạnh tranh theo pháp luật."
        },
        onApprove: { market: -25, equity: 15, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Đất đai và tài chính tiếp tục được ưu ái cấp riêng cho DNNN dù hiệu quả thấp. Bất công bằng trong tiếp cận cơ hội phát triển làm triệt tiêu động lực tư nhân." },
        onReject: { market: 25, equity: -15, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Thực hiện nhất quán chế độ pháp lý kinh doanh bình đẳng, tạo cơ chế tiếp cận đất đai và tài chính sòng phẳng cho mọi doanh nghiệp theo pháp luật." }
    },
    {
        id: "Q306",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #306",
        description: "Một tình trạng \"lợi ích nhóm\" đang thâu tóm các dự án đầu tư công tại địa phương thông qua cơ chế \"xin - cho\", gây thất thoát ngân sách và tạo rào cản cho các doanh nghiệp có năng lực thực sự. Đề xuất giải quyết: Rà soát, hoàn thiện pháp luật về đấu thầu, đầu tư công để xóa bỏ quy định bất hợp lý; đẩy mạnh công khai, minh bạch để ngăn chặn tham nhũng và \"lợi ích nhóm\".",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước cần hoàn thiện thể chế về đấu thầu, đầu tư công và kiên quyết xóa bỏ các quy định bất hợp lý. Việc thực hiện công khai, minh bạch mọi cơ chế, chính sách là bắt buộc để cán bộ, công chức không thể lạm quyền, trục lợi.",
            equity: "Nhà nước cần hoàn thiện thể chế về đấu thầu, đầu tư công và kiên quyết xóa bỏ các quy định bất hợp lý. Việc thực hiện công khai, minh bạch mọi cơ chế, chính sách là bắt buộc để cán bộ, công chức không thể lạm quyền, trục lợi.",
            discipline: "Nhà nước cần hoàn thiện thể chế về đấu thầu, đầu tư công và kiên quyết xóa bỏ các quy định bất hợp lý. Việc thực hiện công khai, minh bạch mọi cơ chế, chính sách là bắt buộc để cán bộ, công chức không thể lạm quyền, trục lợi."
        },
        onApprove: { market: 20, equity: -15, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Luật đấu thầu mới bắt buộc công khai thông tin được triển khai quyết liệt. Xóa bỏ hoàn toàn cơ chế xin-cho, ngăn chặn hiệu quả tiêu cực và trục lợi công." },
        onReject: { market: 25, equity: -30, discipline: -25, headline: "BÁO CHÍ ĐƯA TIN: Tiếp tục duy trì cơ chế xin-cho trong phê duyệt dự án đầu tư công để đẩy nhanh thủ tục. Thất thoát tài sản công nghiêm trọng vào tay các nhóm lợi ích." }
    },
    {
        id: "Q308",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #308",
        description: "Có ý kiến cho rằng cần hạn chế sự phát triển của kinh tế tư nhân để tập trung toàn bộ lực lượng cho kinh tế nhà nước nhằm đảm bảo định hướng XHCN. Đề xuất giải quyết: Đóng ý với ý kiến này để tập trung mọi nguồn lực, hạn chế kinh tế tư nhân.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Trong nền kinh tế thị trường định hướng XHCN, kinh tế tư nhân được xác định là một động lực quan trọng của nền kinh tế. Mọi thành phần kinh tế đều bình đẳng và cạnh tranh lành mạnh.",
            equity: "Trong nền kinh tế thị trường định hướng XHCN, kinh tế tư nhân được xác định là một động lực quan trọng của nền kinh tế. Mọi thành phần kinh tế đều bình đẳng và cạnh tranh lành mạnh.",
            discipline: "Trong nền kinh tế thị trường định hướng XHCN, kinh tế tư nhân được xác định là một động lực quan trọng của nền kinh tế. Mọi thành phần kinh tế đều bình đẳng và cạnh tranh lành mạnh."
        },
        onApprove: { market: -30, equity: 15, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Ban hành các rào cản hành chính nhằm hạn chế sự phát triển của kinh tế tư nhân. Thị trường đìu hiu, sụt giảm năng lực cạnh tranh và hụt thu ngân sách." },
        onReject: { market: 25, equity: -10, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Khẳng định kinh tế tư nhân là động lực quan trọng, tháo gỡ mọi rào cản để khối này cất cánh. Tạo làn sóng đầu tư và khởi nghiệp mạnh mẽ trong toàn dân." }
    },
    {
        id: "Q310",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #310",
        description: "Một dự án FDI lớn muốn đầu tư nhưng yêu cầu được hưởng những cơ chế đặc thù vượt ngoài khung pháp luật hiện hành. Đề xuất giải quyết: Chấp nhận mọi yêu cầu để đảm bảo thu hút vốn và tăng trưởng kinh tế địa phương.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Hoàn thiện thể chế thu hút FDI theo hướng chủ động lựa chọn các dự án có công nghệ tiên tiến, quản trị hiện đại và phù hợp với định hướng cơ cấu lại nền kinh tế.",
            equity: "Hoàn thiện thể chế thu hút FDI theo hướng chủ động lựa chọn các dự án có công nghệ tiên tiến, quản trị hiện đại và phù hợp với định hướng cơ cấu lại nền kinh tế.",
            discipline: "Hoàn thiện thể chế thu hút FDI theo hướng chủ động lựa chọn các dự án có công nghệ tiên tiến, quản trị hiện đại và phù hợp với định hướng cơ cấu lại nền kinh tế."
        },
        onApprove: { market: 25, equity: -20, discipline: -30, headline: "BÁO CHÍ ĐƯA TIN: Chấp nhận đặc cách cơ chế vượt luật trái phép cho tập đoàn ngoại để kéo GDP ngắn hạn. Kỷ cương bị phá vỡ, đe dọa sự phát triển bền vững của đất nước." },
        onReject: { market: -10, equity: 15, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Kiên quyết bác bỏ yêu sách đặc quyền trái luật của tập đoàn ngoại, kiên trì thu hút đầu tư có chọn lọc. Kỷ cương thể chế nghiêm minh được khẳng định vững chắc." }
    },
    {
        id: "Q312",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #312",
        description: "Để thúc đẩy đổi mới sáng tạo, có đề xuất cần nới lỏng các quy định về quản lý nhà nước để doanh nghiệp tự do thực hiện các mô hình kinh doanh mới. Đề xuất giải quyết: Loại bỏ mọi rào cản hành chính không cần thiết, tạo môi trường thuận lợi nhất cho sự sáng tạo của doanh nghiệp.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước cần tạo lập môi trường kinh tế tốt nhất, loại bỏ các rào cản để các chủ thể kinh tế phát huy sức sáng tạo của họ.",
            equity: "Nhà nước cần tạo lập môi trường kinh tế tốt nhất, loại bỏ các rào cản để các chủ thể kinh tế phát huy sức sáng tạo của họ.",
            discipline: "Nhà nước cần tạo lập môi trường kinh tế tốt nhất, loại bỏ các rào cản để các chủ thể kinh tế phát huy sức sáng tạo của họ."
        },
        onApprove: { market: 25, equity: -10, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Loại bỏ triệt để các rào cản hành chính không cần thiết đối với doanh nghiệp. Thúc đẩy mạnh mẽ đổi mới sáng tạo, khơi thông dòng vốn tư nhân vào sản xuất." },
        onReject: { market: -30, equity: 10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Thiết lập các tầng kiểm soát hành chính mới đối với mô hình sáng tạo để đảm bảo an toàn. Bóp nghẹt tinh thần khởi nghiệp, làm chậm bước tiến kinh tế số." }
    },
    {
        id: "Q314",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #314",
        description: "Doanh nghiệp trong nước lo sợ bị phá sản khi Việt Nam mở cửa thị trường theo các hiệp định thương mại quốc tế (FTA). Đề xuất giải quyết: Đóng cửa thị trường để bảo hộ tuyệt đối hàng nội địa.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Bản chất kinh tế thị trường là mở cửa hội nhập; cần nâng cao năng lực cạnh tranh để tham gia vào chuỗi giá trị toàn cầu.",
            equity: "Bản chất kinh tế thị trường là mở cửa hội nhập; cần nâng cao năng lực cạnh tranh để tham gia vào chuỗi giá trị toàn cầu.",
            discipline: "Bản chất kinh tế thị trường là mở cửa hội nhập; cần nâng cao năng lực cạnh tranh để tham gia vào chuỗi giá trị toàn cầu."
        },
        onApprove: { market: -30, equity: 15, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Đóng cửa thị trường để bảo hộ tuyệt đối hàng nội địa trước làn sóng nhập ngoại. Doanh nghiệp trì trệ, người dân gánh chịu hàng hóa giá cao và chất lượng thấp." },
        onReject: { market: 20, equity: -10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Kiên quyết thực hiện các cam kết FTA song hành nâng cao năng lực cạnh tranh quốc gia. Thúc đẩy doanh nghiệp đổi mới công nghệ, đưa hàng Việt vươn tầm thế giới." }
    },
    {
        id: "Q316",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #316",
        description: "Doanh nghiệp sản xuất nông nghiệp gặp khó khăn trong khâu tiêu thụ do thiếu sự liên kết. Đề xuất giải quyết: Thể chế hóa nội dung, phương thức hoạt động của kinh tế tập thể và tăng cường liên kết 4 nhà.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Cần tăng cường các hình thức hợp tác, liên kết và hỗ trợ nông dân trong sản xuất, chế biến và tiêu thụ.",
            equity: "Cần tăng cường các hình thức hợp tác, liên kết và hỗ trợ nông dân trong sản xuất, chế biến và tiêu thụ.",
            discipline: "Cần tăng cường các hình thức hợp tác, liên kết và hỗ trợ nông dân trong sản xuất, chế biến và tiêu thụ."
        },
        onApprove: { market: 15, equity: 25, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Hoàn thiện thể chế kinh tế tập thể, triển khai sâu rộng liên kết 4 nhà trong nông nghiệp. Khắc phục được khâu tiêu thụ yếu, đời sống nông dân phát triển vững chắc." },
        onReject: { market: 20, equity: -10, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Nông dân bị bỏ mặc tự bơi trước biến động cung cầu khốc liệt của thị trường tự phát. Điệp khúc được mùa mất giá lặp lại liên tục, nông nghiệp bấp bênh." }
    },
    {
        id: "Q318",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #318",
        description: "Các đơn vị sự nghiệp công lập (y tế, giáo dục) đang hoạt động trì trệ do thiếu vốn. Đề xuất giải quyết: Hoàn thiện thể chế huy động nguồn lực đầu tư và đổi mới cơ chế quản lý các đơn vị sự nghiệp công.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Cần hoàn thiện thể chế huy động các nguồn lực đầu tư và đổi mới cơ chế quản lý để các đơn vị sự nghiệp công lập phát triển hiệu quả.",
            equity: "Cần hoàn thiện thể chế huy động các nguồn lực đầu tư và đổi mới cơ chế quản lý để các đơn vị sự nghiệp công lập phát triển hiệu quả.",
            discipline: "Cần hoàn thiện thể chế huy động các nguồn lực đầu tư và đổi mới cơ chế quản lý để các đơn vị sự nghiệp công lập phát triển hiệu quả."
        },
        onApprove: { market: 20, equity: 10, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Đổi mới cơ chế huy động vốn và tự chủ tại các đơn vị sự nghiệp công lập (y tế, giáo dục). Chất lượng dịch vụ công được cải thiện mạnh mẽ, bảo đảm an sinh." },
        onReject: { market: 25, equity: -20, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Tư nhân hóa hoàn toàn hệ thống dịch vụ công ích cốt lõi. Người nghèo mất cơ hội tiếp cận y tế, giáo dục chất lượng cao do giá cả leo thang phi mã." }
    },
    {
        id: "Q320",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #320",
        description: "Một số dự án công cộng bị đình trệ vì cơ chế \"xin - cho\" trong phân bổ vốn đầu tư. Đề xuất giải quyết: Xóa bỏ cơ chế \"xin - cho\", thực hiện công khai minh bạch trong phân bổ ngân sách.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Cần hoàn thiện văn bản quy phạm pháp luật để xóa bỏ cơ chế \"xin - cho\", ngăn chặn tham nhũng và trục lợi chính sách.",
            equity: "Cần hoàn thiện văn bản quy phạm pháp luật để xóa bỏ cơ chế \"xin - cho\", ngăn chặn tham nhũng và trục lợi chính sách.",
            discipline: "Cần hoàn thiện văn bản quy phạm pháp luật để xóa bỏ cơ chế \"xin - cho\", ngăn chặn tham nhũng và trục lợi chính sách."
        },
        onApprove: { market: 5, equity: 10, discipline: 10, headline: "BÁO CHÍ ĐƯA TIN: Cơ chế xin-cho trong phân bổ vốn đầu tư công bị xóa bỏ, thay bằng công khai minh bạch. Dự án công cộng hoàn thành nhanh chóng, triệt tiêu tiêu cực hành chính." },
        onReject: { market: 15, equity: -20, discipline: -25, headline: "BÁO CHÍ ĐƯA TIN: Tăng thêm quyền lực tuyệt đối cho người duyệt cấp đầu tư công để đẩy tiến độ. Gây ra sự thiếu minh bạch, tạo mảnh đất màu mỡ cho trục lợi chính sách hoành hành." }
    },
    {
        id: "Q322",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #322",
        description: "Quỹ đất tài nguyên đang bị khai thác lãng phí bởi một số nhóm lợi ích cục bộ. Đề xuất giải quyết: Tiếp tục hoàn thiện pháp luật về đất đai để huy động và sử dụng hiệu quả tài sản công.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Cần tiếp tục hoàn thiện pháp luật về đất đai, tài nguyên để khắc phục tình trạng sử dụng lãng phí và ngăn chặn lợi ích nhóm.",
            equity: "Cần tiếp tục hoàn thiện pháp luật về đất đai, tài nguyên để khắc phục tình trạng sử dụng lãng phí và ngăn chặn lợi ích nhóm.",
            discipline: "Cần tiếp tục hoàn thiện pháp luật về đất đai, tài nguyên để khắc phục tình trạng sử dụng lãng phí và ngăn chặn lợi ích nhóm."
        },
        onApprove: { market: 10, equity: 20, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Luật Đất đai mới thắt chặt quản lý, kiểm soát và sử dụng hiệu quả tài sản công. Khắc phục triệt lãng phí đất đai và ngăn chặn đầu cơ tài nguyên nhà nước." },
        onReject: { market: 30, equity: -20, discipline: -25, headline: "BÁO CHÍ ĐƯA TIN: Cấp phép khai thác đất đai ồ ạt cho mọi thành phần kinh tế để nhanh chóng thu tiền ngân sách ngắn hạn. Tài nguyên bị lãng phí hủy hoại, bùng phát khiếu kiện đất đai." }
    },
    {
        id: "Q323",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #323",
        description: "Để bảo vệ quyền sở hữu trí tuệ của doanh nghiệp trong bối cảnh hội nhập, bạn ưu tiên điều gì? Đề xuất giải quyết: Khuyến khích sáng tạo và bảo vệ quyền sở hữu trí tuệ theo hướng minh bạch, tin cậy.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Hoàn thiện thể chế sở hữu trí tuệ là nội dung quan trọng để khuyến khích sáng tạo trong kinh tế thị trường định hướng XHCN.",
            equity: "Hoàn thiện thể chế sở hữu trí tuệ là nội dung quan trọng để khuyến khích sáng tạo trong kinh tế thị trường định hướng XHCN.",
            discipline: "Hoàn thiện thể chế sở hữu trí tuệ là nội dung quan trọng để khuyến khích sáng tạo trong kinh tế thị trường định hướng XHCN."
        },
        onApprove: { market: 5, equity: 20, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Luật sở hữu trí tuệ được hoàn thiện và thực thi nghiêm minh. Kích thích doanh nghiệp yên tâm đầu tư cho nghiên cứu, sáng tạo ra các công nghệ cốt lõi mới." },
        onReject: { market: 10, equity: -20, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Nhắm mắt cho doanh nghiệp sao chép công nghệ nước ngoài để phát triển nhanh. Doanh nghiệp Việt bị kiện bản quyền quốc tế, gánh chịu chế tài thương mại nặng nề." }
    },
    {
        id: "Q324",
        title: "Sở hữu, Cạnh tranh và Phát triển doanh nghiệp — Hồ sơ #324",
        description: "Một số doanh nghiệp tư nhân nhỏ gặp khó khăn khi tiếp cận vốn so với các doanh nghiệp có quan hệ thân hữu. Đề xuất giải quyết: Thực hiện nhất quán chế độ pháp lý kinh doanh bình đẳng, không phân biệt thành phần kinh tế.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Mọi doanh nghiệp thuộc các thành phần kinh tế đều bình đẳng và cạnh tranh lành mạnh theo pháp luật.",
            equity: "Mọi doanh nghiệp thuộc các thành phần kinh tế đều bình đẳng và cạnh tranh lành mạnh theo pháp luật.",
            discipline: "Mọi doanh nghiệp thuộc các thành phần kinh tế đều bình đẳng và cạnh tranh lành mạnh theo pháp luật."
        },
        onApprove: { market: 15, equity: 20, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Ban hành cơ chế bình đẳng pháp lý giúp các doanh nghiệp nhỏ dễ dàng tiếp cận nguồn vốn vay. Khơi thông sức sản xuất sáng tạo của khu vực tư nhân nhỏ." },
        onReject: { market: 5, equity: -20, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Tập trung toàn bộ nguồn vốn tín dụng nhà nước cho các tập đoàn lớn có quan hệ thân hữu. Bóp nghẹt dòng tiền doanh nghiệp nhỏ, bất bình đẳng thị trường gia tăng." }
    },
    {
        id: "Q401",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #401",
        description: "Trong quá trình hoàn thiện thể chế kinh tế thị trường định hướng XHCN, một số nhóm doanh nghiệp lớn tìm cách vận động chính sách nhằm tạo ra các quy định đặc thù, dựng rào cản kỹ thuật để hạn chế các doanh nghiệp mới gia nhập thị trường. Đề xuất giải quyết: Giữ nguyên các quy định đặc thù để bảo vệ các doanh nghiệp lớn hiện hữu nhằm bảo đảm tính ổn định kinh tế.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Thể chế kinh tế thị trường định hướng XHCN yêu cầu tạo môi trường cạnh tranh lành mạnh, bình đẳng giữa các chủ thể kinh tế; loại bỏ rào cản do \"lợi ích nhóm\" thao túng nhằm bảo đảm hiệu quả phân bổ nguồn lực và công bằng xã hội.",
            equity: "Thể chế kinh tế thị trường định hướng XHCN yêu cầu tạo môi trường cạnh tranh lành mạnh, bình đẳng giữa các chủ thể kinh tế; loại bỏ rào cản do \"lợi ích nhóm\" thao túng nhằm bảo đảm hiệu quả phân bổ nguồn lực và công bằng xã hội.",
            discipline: "Thể chế kinh tế thị trường định hướng XHCN yêu cầu tạo môi trường cạnh tranh lành mạnh, bình đẳng giữa các chủ thể kinh tế; loại bỏ rào cản do \"lợi ích nhóm\" thao túng nhằm bảo đảm hiệu quả phân bổ nguồn lực và công bằng xã hội."
        },
        onApprove: { market: -20, equity: -20, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Duy trì các quy định rào cản kỹ thuật để bảo vệ thế độc quyền của các tập đoàn lớn hiện hữu. Làm triệt tiêu hoàn toàn sự gia nhập thị trường của doanh nghiệp mới." },
        onReject: { market: 20, equity: 15, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Rà soát bãi bỏ các quy định đặc thù bất hợp lý, bảo đảm cạnh tranh bình đẳng. Khơi thông cơ hội khởi nghiệp, thị trường phát triển năng động lành mạnh." }
    },
    {
        id: "Q403",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #403",
        description: "Trong cơ chế phân phối thu nhập và phân bổ ngân sách, một số tổ chức lợi dụng kẽ hở pháp lý để chuyển giá, trốn thuế và chiếm đoạt phúc lợi xã hội. Đề xuất giải quyết: Nới lỏng kiểm tra thuế đối với các tập đoàn lớn để khuyến khích đầu tư và thúc đẩy tăng trưởng bằng mọi giá.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Quan hệ phân phối trong kinh tế thị trường định hướng XHCN phải bảo đảm công bằng, kết hợp phân phối theo lao động, hiệu quả kinh tế với hệ thống an sinh xã hội; ngăn chặn tiêu cực và gian lận thuế để tránh làm méo mó bản chất tốt đẹp của chế độ.",
            equity: "Quan hệ phân phối trong kinh tế thị trường định hướng XHCN phải bảo đảm công bằng, kết hợp phân phối theo lao động, hiệu quả kinh tế với hệ thống an sinh xã hội; ngăn chặn tiêu cực và gian lận thuế để tránh làm méo mó bản chất tốt đẹp của chế độ.",
            discipline: "Quan hệ phân phối trong kinh tế thị trường định hướng XHCN phải bảo đảm công bằng, kết hợp phân phối theo lao động, hiệu quả kinh tế với hệ thống an sinh xã hội; ngăn chặn tiêu cực và gian lận thuế để tránh làm méo mó bản chất tốt đẹp của chế độ."
        },
        onApprove: { market: 20, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Việc buông lỏng kiểm tra thuế đối với các tập đoàn lớn để khuyến khích đầu tư đã bị lạm dụng. Bùng phát các hành vi chuyển giá trốn thuế gây hụt thu ngân sách lớn." },
        onReject: { market: -10, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Siết chặt kiểm tra thuế và hoàn thiện quản lý tài chính doanh nghiệp lớn. Đẩy lùi tiêu cực tài chính ngân sách dồi dào để đầu tư lại cho an sinh xã hội." }
    },
    {
        id: "Q405",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #405",
        description: "Một số doanh nghiệp nhà nước nắm giữ vị trí then chốt bị các \"nhóm lợi ích\" thao túng làm thất thoát vốn công và giảm hiệu quả kinh tế. Đề xuất giải quyết: Tiếp tục cấp bù vốn và trao đặc quyền độc quyền kinh doanh cho các doanh nghiệp này để duy trì vai trò chủ đạo.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Kinh tế nhà nước giữ vai trò chủ đạo thông qua thực lực và hiệu quả kinh tế, không phải bằng sự bao cấp hay bảo kê cho các vi phạm, thất thoát do \"lợi ích nhóm\" gây ra.",
            equity: "Kinh tế nhà nước giữ vai trò chủ đạo thông qua thực lực và hiệu quả kinh tế, không phải bằng sự bao cấp hay bảo kê cho các vi phạm, thất thoát do \"lợi ích nhóm\" gây ra.",
            discipline: "Kinh tế nhà nước giữ vai trò chủ đạo thông qua thực lực và hiệu quả kinh tế, không phải bằng sự bao cấp hay bảo kê cho các vi phạm, thất thoát do \"lợi ích nhóm\" gây ra."
        },
        onApprove: { market: -25, equity: -15, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Tiếp tục cấp bù vốn ngân sách cho DNNN yếu kém nắm giữ vị thế độc quyền. Tài sản nhà nước tiếp tục bị thất thoát nghiêm trọng vào tay các nhóm lợi ích." },
        onReject: { market: 20, equity: 10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Thực hiện tái cơ cấu toàn diện DNNN, áp dụng quản trị hiện đại công khai minh bạch. DNNN hoạt động hiệu quả bảo toàn hiệu quả nguồn vốn công." }
    },
    {
        id: "Q407",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #407",
        description: "Xuất hiện tình trạng doanh nghiệp chi hối lộ để bỏ qua các quy định về bảo vệ môi trường và an toàn lao động nhằm tối đa hóa lợi nhuận. Đề xuất giải quyết: Giảm nhẹ hình phạt để doanh nghiệp tập trung nguồn lực mở rộng sản xuất, giải quyết việc làm trước mắt.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Tăng trưởng kinh tế phải đi đôi với tiến bộ và công bằng xã hội; không được hy sinh môi trường và an sinh xã hội để đổi lấy tăng trưởng đơn thuần hoặc phục vụ lợi ích cục bộ.",
            equity: "Tăng trưởng kinh tế phải đi đôi với tiến bộ và công bằng xã hội; không được hy sinh môi trường và an sinh xã hội để đổi lấy tăng trưởng đơn thuần hoặc phục vụ lợi ích cục bộ.",
            discipline: "Tăng trưởng kinh tế phải đi đôi với tiến bộ và công bằng xã hội; không được hy sinh môi trường và an sinh xã hội để đổi lấy tăng trưởng đơn thuần hoặc phục vụ lợi ích cục bộ."
        },
        onApprove: { market: 15, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Phạt nhẹ hành vi xả thải của doanh nghiệp để bảo vệ tăng trưởng sản lượng trước mắt. Gây hủy hoại môi trường sống nghiêm trọng vấp phải sự bất bình lớn của người dân." },
        onReject: { market: -15, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Xử phạt nghiêm khắc và bắt buộc đền bù thiệt hại môi trường đối với các doanh nghiệp vi phạm. Kỷ cương nghiêm minh bảo đảm phát triển kinh tế bền vững." }
    },
    {
        id: "Q409",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #409",
        description: "Trong lĩnh vực thu hút đầu tư nước ngoài (FDI), một số nhà đầu tư thỏa thuận ngầm với lãnh đạo địa phương để nhận được các ưu đãi vượt khung pháp lý, gây thiệt hại cho ngân sách. Đề xuất giải quyết: Cho phép các ưu đãi riêng biệt này để bằng mọi giá thu hút vốn đầu tư lớn.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Thế chế kinh tế thị trường định hướng XHCN đòi hỏi hệ thống pháp luật thống nhất, bình đẳng, không cho phép cơ chế ưu đãi cục bộ tạo điều kiện cho tiêu cực và tham nhũng chính sách.",
            equity: "Thế chế kinh tế thị trường định hướng XHCN đòi hỏi hệ thống pháp luật thống nhất, bình đẳng, không cho phép cơ chế ưu đãi cục bộ tạo điều kiện cho tiêu cực và tham nhũng chính sách.",
            discipline: "Thế chế kinh tế thị trường định hướng XHCN đòi hỏi hệ thống pháp luật thống nhất, bình đẳng, không cho phép cơ chế ưu đãi cục bộ tạo điều kiện cho tiêu cực và tham nhũng chính sách."
        },
        onApprove: { market: 15, equity: -20, discipline: -25, headline: "BÁO CHÍ ĐƯA TIN: Chấp nhận các thỏa thuận ưu đãi ngầm vượt khung pháp lý để thu hút nhanh vốn ngoại FDI. Làm méo mó môi trường kinh doanh và kỷ cương pháp lý bị phá vỡ." },
        onReject: { market: -10, equity: 15, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Kiên quyết bãi bỏ các ưu đãi trái luật, chuẩn hóa khung chính sách đầu tư chung công bằng. Thu hút đầu tư FDI lành mạnh bảo vệ uy tín thể chế quốc gia." }
    },
    {
        id: "Q411",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #411",
        description: "Một số cơ quan quản lý ban hành các \"giấy phép con\" không cần thiết nhằm gây khó khăn cho doanh nghiệp để ép buộc phát sinh chi phí \"bôi trơn\". Đề xuất giải quyết: Giữ nguyên các thủ tục để bảo đảm kiểm soát chặt chẽ mọi hoạt động kinh doanh.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Cải cách thủ tục hành chính, loại bỏ \"giấy phép con\" là giải pháp quan trọng nhằm giảm chi phí tuân thủ, triệt tiêu cơ hội nhũng nhiễu của bộ máy quản lý đối với doanh nghiệp.",
            equity: "Cải cách thủ tục hành chính, loại bỏ \"giấy phép con\" là giải pháp quan trọng nhằm giảm chi phí tuân thủ, triệt tiêu cơ hội nhũng nhiễu của bộ máy quản lý đối với doanh nghiệp.",
            discipline: "Cải cách thủ tục hành chính, loại bỏ \"giấy phép con\" là giải pháp quan trọng nhằm giảm chi phí tuân thủ, triệt tiêu cơ hội nhũng nhiễu của bộ máy quản lý đối với doanh nghiệp."
        },
        onApprove: { market: -25, equity: -10, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Duy trì hệ thống thủ tục hành chính phức tạp để tăng quyền kiểm soát. Làm gia tăng gánh nặng chi phí bôi trơn, nhũng nhiễu và gây ức chế cho doanh nghiệp." },
        onReject: { market: 25, equity: 10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Đẩy mạnh dịch vụ công trực tuyến, cắt giảm triệt để các thủ tục hành chính rườm rà. Triệt tiêu cơ hội nhũng nhiễu, doanh nghiệp hoạt động thông thoáng hiệu quả." }
    },
    {
        id: "Q413",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #413",
        description: "Một nhóm doanh nghiệp lớn vận động hành lang để duy trì các thủ tục hành chính phức tạp nhằm ngăn chặn các đối thủ mới gia nhập thị trường, tạo thế độc quyền nhóm. Đề xuất giải quyết: Rà soát, bãi bỏ các rào cản hành chính bất hợp lý, bảo đảm quyền tự do kinh doanh bình đẳng.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Cần hoàn thiện pháp luật về đầu tư, kinh doanh, bảo đảm đầy đủ quyền tự do kinh doanh, cạnh tranh lành mạnh. Đồng thời phải xóa bỏ các rào cản đối với hoạt động đầu tư, kinh doanh.",
            equity: "Cần hoàn thiện pháp luật về đầu tư, kinh doanh, bảo đảm đầy đủ quyền tự do kinh doanh, cạnh tranh lành mạnh. Đồng thời phải xóa bỏ các rào cản đối với hoạt động đầu tư, kinh doanh.",
            discipline: "Cần hoàn thiện pháp luật về đầu tư, kinh doanh, bảo đảm đầy đủ quyền tự do kinh doanh, cạnh tranh lành mạnh. Đồng thời phải xóa bỏ các rào cản đối với hoạt động đầu tư, kinh doanh."
        },
        onApprove: { market: 25, equity: 15, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Cắt giảm rào cản hành chính giúp doanh nghiệp mới gia nhập thị trường dễ dàng. Xóa bỏ hoàn toàn thế độc quyền nhóm, thị trường cạnh tranh sôi nổi lành mạnh." },
        onReject: { market: -25, equity: -20, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Giữ nguyên quy trình phức tạp để bảo vệ các tập đoàn lớn đang đóng góp nhiều thuế. Bóp nghẹt tinh thần khởi nghiệp môi trường đầu tư bị đánh giá thiếu minh bạch." }
    },
    {
        id: "Q415",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #415",
        description: "Trong việc phân phối thu nhập, có ý kiến cho rằng nên để thị trường tự quyết định hoàn toàn nhằm kích thích các nhóm giàu có đầu tư thêm, bất chấp khoảng cách giàu nghèo đang tăng nhanh. Đề xuất giải quyết: Thực hiện chính sách phân phối lại qua thuế và an sinh xã hội để điều tiết thu nhập.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nền kinh tế thị trường định hướng XHCN thực hiện gắn tăng trưởng kinh tế với công bằng xã hội, thực hiện tiến bộ và công bằng xã hội ngay trong từng chính sách. Không \"hy sinh\" tiến bộ và công bằng xã hội để chạy theo tăng trưởng kinh tế đơn thuần.",
            equity: "Nền kinh tế thị trường định hướng XHCN thực hiện gắn tăng trưởng kinh tế với công bằng xã hội, thực hiện tiến bộ và công bằng xã hội ngay trong từng chính sách. Không \"hy sinh\" tiến bộ và công bằng xã hội để chạy theo tăng trưởng kinh tế đơn thuần.",
            discipline: "Nền kinh tế thị trường định hướng XHCN thực hiện gắn tăng trưởng kinh tế với công bằng xã hội, thực hiện tiến bộ và công bằng xã hội ngay trong từng chính sách. Không \"hy sinh\" tiến bộ và công bằng xã hội để chạy theo tăng trưởng kinh tế đơn thuần."
        },
        onApprove: { market: -20, equity: 25, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Thực hiện chính sách phân phối lại hiệu quả qua thuế thu nhập lũy tiến và mạng lưới an sinh. Ổn định đời sống nhân dân nghèo, bảo đảm công bằng xã hội." },
        onReject: { market: 25, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Thả nổi quan hệ phân phối theo quy luật thị trường tự phát để tích lũy tư bản nhanh. Phân hóa giàu nghèo sâu sắc đe dọa trực tiếp trật tự và an ninh xã hội." }
    },
    {
        id: "Q417",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #417",
        description: "Trước tình trạng tham nhũng và \"lợi ích nhóm\" tiêu cực núp bóng các quy định pháp luật chồng chéo, bạn sẽ làm gì để củng cố thể chế? Đề xuất giải quyết: Rà soát, hoàn thiện hệ thống pháp luật, đảm bảo công khai, minh bạch để ngăn chặn trục lợi.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Cần rà soát, hoàn thiện các quy định pháp luật bảo đảm công khai, minh bạch, góp phần xóa bỏ cơ chế \"xin - cho\". Đây là biện pháp nhằm ngăn chặn, đẩy lùi tham nhũng, tiêu cực và \"lợi ích nhóm\".",
            equity: "Cần rà soát, hoàn thiện các quy định pháp luật bảo đảm công khai, minh bạch, góp phần xóa bỏ cơ chế \"xin - cho\". Đây là biện pháp nhằm ngăn chặn, đẩy lùi tham nhũng, tiêu cực và \"lợi ích nhóm\".",
            discipline: "Cần rà soát, hoàn thiện các quy định pháp luật bảo đảm công khai, minh bạch, góp phần xóa bỏ cơ chế \"xin - cho\". Đây là biện pháp nhằm ngăn chặn, đẩy lùi tham nhũng, tiêu cực và \"lợi ích nhóm\"."
        },
        onApprove: { market: -15, equity: 20, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Rà soát luật pháp và minh bạch hóa chính sách quy hoạch đất đai đầu tư công. Xóa bỏ hoàn toàn cơ hội trục lợi chính sách của các nhóm lợi ích, kỷ cương vững chắc." },
        onReject: { market: -25, equity: -15, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Gia tăng các thủ tục hành chính xin-cho phức tạp để tăng cường giám sát doanh nghiệp. Tạo mảnh đất màu mỡ cho tệ nạn nhũng nhiễu và tiêu cực chính sách bùng phát." }
    },
    {
        id: "Q419",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #419",
        description: "Một nhóm lợi ích đề xuất dự án khai thác tài nguyên có lợi nhuận cao nhưng gây ô nhiễm môi trường nghiêm trọng và ảnh hưởng đến cộng đồng dân cư. Đề xuất giải quyết: Phê duyệt dự án để đảm bảo mục tiêu tăng trưởng kinh tế và lợi nhuận doanh nghiệp.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Cần xây dựng hệ thống thể chế để kết hợp chặt chẽ phát triển kinh tế nhanh, bền vững với phát triển xã hội bền vững. Việc hội nhập mở cửa phải đối phó với nguy cơ ô nhiễm môi trường, do đó không thể để lợi ích nhóm gây tổn hại quốc gia.",
            equity: "Cần xây dựng hệ thống thể chế để kết hợp chặt chẽ phát triển kinh tế nhanh, bền vững với phát triển xã hội bền vững. Việc hội nhập mở cửa phải đối phó với nguy cơ ô nhiễm môi trường, do đó không thể để lợi ích nhóm gây tổn hại quốc gia.",
            discipline: "Cần xây dựng hệ thống thể chế để kết hợp chặt chẽ phát triển kinh tế nhanh, bền vững với phát triển xã hội bền vững. Việc hội nhập mở cửa phải đối phó với nguy cơ ô nhiễm môi trường, do đó không thể để lợi ích nhóm gây tổn hại quốc gia."
        },
        onApprove: { market: 25, equity: -30, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Phê duyệt dự án khai thác tài nguyên siêu lợi nhuận của nhóm lợi ích bất chấp hủy hoại sinh thái. Ngân sách tăng ngắn hạn nhưng gánh chịu thảm họa môi trường dài hạn." },
        onReject: { market: -20, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Kiên quyết đình chỉ dự án tàn phá môi trường để bảo vệ sinh kế lâu dài của cộng đồng. Thể hiện cam kết phát triển kinh tế đi đôi với tiến bộ công bằng xã hội." }
    },
    {
        id: "Q421",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #421",
        description: "Người lao động bị một nhóm chủ doanh nghiệp ép lương và cắt giảm bảo hiểm để tăng lợi nhuận nhóm. Đề xuất giải quyết: Ưu tiên hỗ trợ doanh nghiệp giảm chi phí để duy trì năng lực cạnh tranh thị trường.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Quan hệ lợi ích kinh tế giữa người lao động và người sử dụng lao động vừa thống nhất, vừa mâu thuẫn với nhau. Cần có tổ chức Công đoàn bảo vệ quyền lợi của người lao động và việc đấu tranh phải tuân thủ các quy định của pháp luật.",
            equity: "Quan hệ lợi ích kinh tế giữa người lao động và người sử dụng lao động vừa thống nhất, vừa mâu thuẫn với nhau. Cần có tổ chức Công đoàn bảo vệ quyền lợi của người lao động và việc đấu tranh phải tuân thủ các quy định của pháp luật.",
            discipline: "Quan hệ lợi ích kinh tế giữa người lao động và người sử dụng lao động vừa thống nhất, vừa mâu thuẫn với nhau. Cần có tổ chức Công đoàn bảo vệ quyền lợi của người lao động và việc đấu tranh phải tuân thủ các quy định của pháp luật."
        },
        onApprove: { market: 25, equity: -30, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Nhắm mắt cho doanh nghiệp tự do ép lương và cắt giảm bảo hiểm để giảm chi phí sản xuất. Công nhân đình công hàng loạt phá vỡ chuỗi liên kết lao động." },
        onReject: { market: -15, equity: 25, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Phát huy vai trò Công đoàn và luật pháp bảo vệ quyền lợi hợp pháp người lao động. Quan hệ lao động hài hòa ổn định giúp nâng cao năng suất nhà máy bền vững." }
    },
    {
        id: "Q423",
        title: "Kiểm soát Lợi ích nhóm và Tiêu cực — Hồ sơ #423",
        description: "Có tình trạng một số \"nhóm lợi ích\" chiếm giữ nguồn tài nguyên nhưng không đưa vào sản xuất mà chờ tăng giá để trục lợi. Đề xuất giải quyết: Hoàn thiện thể chế về sở hữu, đánh thuế cao hoặc thu hồi tài nguyên không sử dụng.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Cần tiếp tục hoàn thiện pháp luật về đất đai, tài nguyên để huy động, phân bổ và sử dụng hiệu quả tài nguyên. Việc này nhằm mục đích khắc phục tình trạng sử dụng lãng phí đất đai và tài nguyên thiên nhiên.",
            equity: "Cần tiếp tục hoàn thiện pháp luật về đất đai, tài nguyên để huy động, phân bổ và sử dụng hiệu quả tài nguyên. Việc này nhằm mục đích khắc phục tình trạng sử dụng lãng phí đất đai và tài nguyên thiên nhiên.",
            discipline: "Cần tiếp tục hoàn thiện pháp luật về đất đai, tài nguyên để huy động, phân bổ và sử dụng hiệu quả tài nguyên. Việc này nhằm mục đích khắc phục tình trạng sử dụng lãng phí đất đai và tài nguyên thiên nhiên."
        },
        onApprove: { market: -25, equity: 20, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Hoàn thiện thể chế sở hữu, áp thuế cao và thu hồi ruộng đất găm giữ bỏ hoang của nhóm đầu cơ. Giải phóng quỹ đất sạch khơi thông nguồn vốn vào sản xuất thực." },
        onReject: { market: 25, equity: -20, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Tôn trọng quyền găm giữ chiếm hữu tài nguyên chờ thổi giá của nhóm đầu cơ. Giá đất nền leo thang chóng mặt làm tăng chi phí sản xuất bóp nghẹt doanh nghiệp thực." }
    },
    {
        id: "Q501",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #501",
        description: "Các quy định về giá đất hiện chưa sát với thị trường dẫn đến lãng phí tài nguyên và khởi kiện hành chính kéo dài. Đề xuất giải quyết: Hoàn thiện pháp luật về đất đai để huy động, phân bổ và sử dụng hiệu quả tài nguyên, khắc phục tình trạng sử dụng đất lãng phí.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Tiếp tục hoàn thiện pháp luật về đất đai là nội dung trọng tâm để sử dụng hiệu quả nguồn lực tài nguyên và bảo đảm công bằng trong phân bổ lợi ích.",
            equity: "Tiếp tục hoàn thiện pháp luật về đất đai là nội dung trọng tâm để sử dụng hiệu quả nguồn lực tài nguyên và bảo đảm công bằng trong phân bổ lợi ích.",
            discipline: "Tiếp tục hoàn thiện pháp luật về đất đai là nội dung trọng tâm để sử dụng hiệu quả nguồn lực tài nguyên và bảo đảm công bằng trong phân bổ lợi ích."
        },
        onApprove: { market: 30, equity: 30, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Luật Đất đai mới đưa định giá đất sát với thực tế thị trường chính thức được thông qua. Đẩy lùi lãng phí tài nguyên công, khơi thông các dự án đầu tư lớn." },
        onReject: { market: 10, equity: -30, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Áp dụng cơ chế định giá đền bù đất thấp bằng mệnh lệnh hành chính để giải phóng nhanh mặt bằng. Bùng phát tranh chấp khiếu kiện đất đai gay gắt kéo dài." }
    },
    {
        id: "Q503",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #503",
        description: "Nhiều nhóm yếu thế trong xã hội đang bị bỏ lại phía sau do rủi ro từ thị trường. Đề xuất giải quyết: Hoàn thiện hệ thống an sinh xã hội, trợ giúp các nhóm yếu thế tiếp cận bình đẳng các dịch vụ xã hội cơ bản (y tế, giáo dục).",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước có vai trò hỗ trợ các nhóm dân cư có thu nhập thấp, gặp rủi ro nhằm giảm bớt sự bất bình đẳng do kinh tế thị trường gây ra.",
            equity: "Nhà nước có vai trò hỗ trợ các nhóm dân cư có thu nhập thấp, gặp rủi ro nhằm giảm bớt sự bất bình đẳng do kinh tế thị trường gây ra.",
            discipline: "Nhà nước có vai trò hỗ trợ các nhóm dân cư có thu nhập thấp, gặp rủi ro nhằm giảm bớt sự bất bình đẳng do kinh tế thị trường gây ra."
        },
        onApprove: { market: -25, equity: 30, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Hoàn thiện hệ thống an sinh xã hội toàn dân trợ giúp các nhóm yếu thế tiếp cận y tế giáo dục. Tạo nền tảng ổn định vững chắc cho sự phát triển lâu dài." },
        onReject: { market: 25, equity: -30, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Cắt giảm chi ngân sách an sinh xã hội để dồn vốn làm hạ tầng kỹ thuật kéo GDP. Người nghèo kiệt quệ phân hóa giàu nghèo tăng cao gây bất ổn xã hội." }
    },
    {
        id: "Q504",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #504",
        description: "Bạn đứng trước quyết định phê duyệt dự án khai thác mỏ có lợi nhuận cao nhưng nguy cơ gây ô nhiễm môi trường sống nghiêm trọng. Đề xuất giải quyết: Chấp thuận dự án để tạo nguồn thu ngân sách lớn nhằm giải quyết các mục tiêu tăng trưởng ngắn hạn.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Nhà nước phải kiểm soát và ngăn chặn các lợi ích kinh tế gây tổn hại đến môi trường và sự phát triển bền vững của cộng đồng.",
            equity: "Nhà nước phải kiểm soát và ngăn chặn các lợi ích kinh tế gây tổn hại đến môi trường và sự phát triển bền vững của cộng đồng.",
            discipline: "Nhà nước phải kiểm soát và ngăn chặn các lợi ích kinh tế gây tổn hại đến môi trường và sự phát triển bền vững của cộng đồng."
        },
        onApprove: { market: 30, equity: -30, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Phê duyệt dự án khai mỏ có lợi nhuận cao của doanh nghiệp bất chấp ô nhiễm môi trường. Ngân sách tăng ngắn hạn nhưng gánh chịu thảm họa sinh thái nguồn nước." },
        onReject: { market: -30, equity: 25, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Kiên quyết bác bỏ dự án có nguy cơ tàn phá môi trường để bảo vệ sinh thái bền vững. Bảo đảm sinh kế lâu dài cho cộng đồng cư dân vùng mỏ định hướng XHCN." }
    },
    {
        id: "Q506",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #506",
        description: "Hệ thống thuế thu nhập cá nhân đang bị đánh giá là chưa điều tiết hiệu quả khoảng cách giàu nghèo. Đề xuất giải quyết: Cải cách chính sách thuế để điều tiết thu nhập hợp lý, dùng nguồn thu đó đầu tư cho an sinh và nhóm yếu thế.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Chính sách phân phối thu nhập của Nhà nước có vai trò làm thay đổi mức thu nhập và tương quan thu nhập, nhằm thực hiện công bằng xã hội trong phân phối.",
            equity: "Chính sách phân phối thu nhập của Nhà nước có vai trò làm thay đổi mức thu nhập và tương quan thu nhập, nhằm thực hiện công bằng xã hội trong phân phối.",
            discipline: "Chính sách phân phối thu nhập của Nhà nước có vai trò làm thay đổi mức thu nhập và tương quan thu nhập, nhằm thực hiện công bằng xã hội trong phân phối."
        },
        onApprove: { market: -20, equity: 30, discipline: 15, headline: "BÁO CHÍ ĐƯA TIN: Luật thuế thu nhập cá nhân lũy tiến mới được ban hành đi vào cuộc sống. Điều tiết thu nhập hiệu quả, bổ sung ngân sách đầu tư cho giáo dục và an sinh công cộng." },
        onReject: { market: 25, equity: -30, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Áp dụng thuế phẳng giống nhau để thu hút vốn làm giàu nhanh của giới siêu giàu. Làm suy yếu an sinh xã hội khoảng cách giàu nghèo nới rộng nhanh chóng." }
    },
    {
        id: "Q507",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #507",
        description: "Bộ máy hành chính hiện tại rườm rà, gây khó khăn cho các doanh nghiệp khi làm thủ tục. Đề xuất giải quyết: Tăng thêm các lớp kiểm soát bằng giấy tờ thủ công để đảm bảo \"chống sai sót\" tuyệt đối trong quản lý.",
        correctAnswer: "Từ chối",
        advisors: {
            market: "Việc ứng dụng hạ tầng số và thực hiện mô hình \"chính phủ điện tử\" là yêu cầu để cải tổ bộ máy hành chính theo hướng minh bạch và hiệu quả.",
            equity: "Việc ứng dụng hạ tầng số và thực hiện mô hình \"chính phủ điện tử\" là yêu cầu để cải tổ bộ máy hành chính theo hướng minh bạch và hiệu quả.",
            discipline: "Việc ứng dụng hạ tầng số và thực hiện mô hình \"chính phủ điện tử\" là yêu cầu để cải tổ bộ máy hành chính theo hướng minh bạch và hiệu quả."
        },
        onApprove: { market: -30, equity: 15, discipline: -25, headline: "BÁO CHÍ ĐƯA TIN: Gia tăng các lớp kiểm soát bằng giấy tờ thủ công để đảm bảo an toàn tuyệt đối hành chính. Doanh nghiệp mệt mỏi vì thủ tục, triệt tiêu động lực đổi mới sáng tạo." },
        onReject: { market: 30, equity: -20, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Hệ thống dịch vụ công trực tuyến và chính phủ điện tử vận hành thông suốt rộng khắp. Thời gian làm thủ tục giảm 80%, doanh nghiệp hoạt động vô cùng năng động." }
    },
    {
        id: "Q509",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #509",
        description: "Một địa phương có nhiều doanh nghiệp phản ánh rằng thủ tục đầu tư còn chồng chéo, thiếu minh bạch, khiến nhiều dự án bị đình trệ. Đề xuất giải quyết: Hoàn thiện pháp luật về đầu tư, kinh doanh; xóa bỏ các rào cản bất hợp lý; bảo đảm quyền tự do kinh doanh và cạnh tranh lành mạnh theo pháp luật.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước cần hoàn thiện pháp luật về đầu tư, kinh doanh, bảo đảm quyền tự do kinh doanh và cạnh tranh lành mạnh, đồng thời xóa bỏ các rào cản bất hợp lý. Việc tăng thêm thủ tục hành chính làm giảm tính thông suốt của thị trường và hiệu quả thể chế.",
            equity: "Nhà nước cần hoàn thiện pháp luật về đầu tư, kinh doanh, bảo đảm quyền tự do kinh doanh và cạnh tranh lành mạnh, đồng thời xóa bỏ các rào cản bất hợp lý. Việc tăng thêm thủ tục hành chính làm giảm tính thông suốt của thị trường và hiệu quả thể chế.",
            discipline: "Nhà nước cần hoàn thiện pháp luật về đầu tư, kinh doanh, bảo đảm quyền tự do kinh doanh và cạnh tranh lành mạnh, đồng thời xóa bỏ các rào cản bất hợp lý. Việc tăng thêm thủ tục hành chính làm giảm tính thông suốt của thị trường và hiệu quả thể chế."
        },
        onApprove: { market: 25, equity: 10, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Luật đầu tư thông thoáng được ban hành, tháo gỡ mọi rào cản thủ tục hành chính. Khí thế thành lập doanh nghiệp bùng nổ, thúc đẩy kinh tế phát triển sôi động." },
        onReject: { market: -20, equity: 10, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Ban hành các điều kiện cấp phép mới để Nhà nước quản lý chặt chẽ hoạt động kinh tế trước. Gia tăng rào cản hành chính làm kìm hãm hoàn toàn động lực của tư nhân." }
    },
    {
        id: "Q510",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #510",
        description: "Nền kinh tế đang xuất hiện đồng thời tình trạng giá cả tăng nhanh, thị trường tài chính biến động và hoạt động sản xuất của doanh nghiệp có dấu hiệu suy giảm. Một số ý kiến đề nghị Nhà nước không nên can thiệp vì cho rằng thị trường sẽ tự điều chỉnh. Đề xuất giải quyết: Nhà nước sử dụng pháp luật, chiến lược, kế hoạch, chính sách và các công cụ kinh tế phù hợp để ổn định các cân đối kinh tế vĩ mô, hạn chế tác động tiêu cực của biến động thị trường; đồng thời vẫn tôn trọng các nguyên tắc của thị trường và tạo điều kiện cho doanh nghiệp chủ động sản xuất, kinh doanh.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước phải sử dụng pháp luật, chính sách và công cụ kinh tế để bảo đảm các cân đối vĩ mô, khắc phục khuyết tật của thị trường nhưng vẫn tôn trọng nguyên tắc thị trường. Để thị trường tự điều tiết hoàn toàn là phủ nhận vai trò quản lý, điều tiết của Nhà nước.",
            equity: "Nhà nước phải sử dụng pháp luật, chính sách và công cụ kinh tế để bảo đảm các cân đối vĩ mô, khắc phục khuyết tật của thị trường nhưng vẫn tôn trọng nguyên tắc thị trường. Để thị trường tự điều tiết hoàn toàn là phủ nhận vai trò quản lý, điều tiết của Nhà nước.",
            discipline: "Nhà nước phải sử dụng pháp luật, chính sách và công cụ kinh tế để bảo đảm các cân đối vĩ mô, khắc phục khuyết tật của thị trường nhưng vẫn tôn trọng nguyên tắc thị trường. Để thị trường tự điều tiết hoàn toàn là phủ nhận vai trò quản lý, điều tiết của Nhà nước."
        },
        onApprove: { market: 20, equity: -10, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Nhà nước chủ động dùng các đòn bẩy tài khóa tiền tệ để can thiệp ổn định vĩ mô. Kiểm soát lạm phát thành công, bảo đảm an sinh xã hội cho người lao động nghèo." },
        onReject: { market: 30, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Thả nổi nền kinh tế tự điều tiết trước cơn bão khủng hoảng tài chính thế giới. Lạm phát bùng nổ phi mã tiền mất giá làm đời sống nhân dân nghèo khốn đốn." }
    },
    {
        id: "Q512",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #512",
        description: "Một tập đoàn nước ngoài đề xuất đầu tư dự án quy mô lớn, tạo nhiều việc làm nhưng chỉ sử dụng công nghệ trung bình, chủ yếu nhập nguyên liệu và thiết bị từ bên ngoài, không cam kết chuyển giao công nghệ hoặc liên kết với doanh nghiệp trong nước. Một dự án khác có quy mô nhỏ hơn nhưng sử dụng công nghệ tiên tiến, có trung tâm nghiên cứu tại Việt Nam và cam kết hỗ trợ doanh nghiệp trong nước tham gia chuỗi giá trị toàn cầu. Đề xuất giải quyết: Ưu tiên dự án có công nghệ tiên tiến, năng lực quản trị hiện đại, hoạt động nghiên cứu và phát triển tại Việt Nam, đồng thời yêu cầu cam kết chuyển giao công nghệ và liên kết với doanh nghiệp trong nước.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước cần chủ động lựa chọn FDI có công nghệ tiên tiến, quản trị hiện đại, hoạt động nghiên cứu tại Việt Nam và liên kết với doanh nghiệp trong nước. Chỉ chú trọng quy mô vốn và việc làm trước mắt không phù hợp với định hướng nâng cao chất lượng đầu tư.",
            equity: "Nhà nước cần chủ động lựa chọn FDI có công nghệ tiên tiến, quản trị hiện đại, hoạt động nghiên cứu tại Việt Nam và liên kết với doanh nghiệp trong nước. Chỉ chú trọng quy mô vốn và việc làm trước mắt không phù hợp với định hướng nâng cao chất lượng đầu tư.",
            discipline: "Nhà nước cần chủ động lựa chọn FDI có công nghệ tiên tiến, quản trị hiện đại, hoạt động nghiên cứu tại Việt Nam và liên kết với doanh nghiệp trong nước. Chỉ chú trọng quy mô vốn và việc làm trước mắt không phù hợp với định hướng nâng cao chất lượng đầu tư."
        },
        onApprove: { market: 20, equity: -10, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Chủ động lựa chọn dự án FDI công nghệ cao cam kết hỗ trợ doanh nghiệp Việt tham gia chuỗi. Thúc đẩy mạnh mẽ năng lực tự chủ công nghệ sản xuất quốc gia." },
        onReject: { market: 30, equity: -20, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Chấp nhận dự án FDI quy mô lớn sử dụng công nghệ trung bình khép kín chuỗi cung ứng. FDI hưởng lợi lớn còn doanh nghiệp nội bị gạt ra bãi thải công nghệ." }
    },
    {
        id: "Q513",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #513",
        description: "Sau nhiều năm phát triển, khu vực doanh nghiệp nhỏ và vừa tại một địa phương vẫn gặp khó khăn trong việc tiếp cận vốn, công nghệ và thị trường. Một số ý kiến cho rằng Nhà nước không nên hỗ trợ vì doanh nghiệp phải tự cạnh tranh để tồn tại. Đề xuất giải quyết: Hoàn thiện chính sách hỗ trợ doanh nghiệp nhỏ và vừa; tạo điều kiện để khu vực kinh tế tư nhân phát triển, đồng thời khuyến khích đổi mới công nghệ, nâng cao năng lực quản trị và cạnh tranh theo cơ chế thị trường.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước cần hoàn thiện chính sách hỗ trợ doanh nghiệp nhỏ và vừa, tạo điều kiện để kinh tế tư nhân trở thành động lực quan trọng nhưng không bao cấp. Chấm dứt toàn bộ hỗ trợ sẽ phủ nhận vai trò kiến tạo và làm gia tăng bất lợi về nguồn lực, công nghệ và thị trường.",
            equity: "Nhà nước cần hoàn thiện chính sách hỗ trợ doanh nghiệp nhỏ và vừa, tạo điều kiện để kinh tế tư nhân trở thành động lực quan trọng nhưng không bao cấp. Chấm dứt toàn bộ hỗ trợ sẽ phủ nhận vai trò kiến tạo và làm gia tăng bất lợi về nguồn lực, công nghệ và thị trường.",
            discipline: "Nhà nước cần hoàn thiện chính sách hỗ trợ doanh nghiệp nhỏ và vừa, tạo điều kiện để kinh tế tư nhân trở thành động lực quan trọng nhưng không bao cấp. Chấm dứt toàn bộ hỗ trợ sẽ phủ nhận vai trò kiến tạo và làm gia tăng bất lợi về nguồn lực, công nghệ và thị trường."
        },
        onApprove: { market: 25, equity: 10, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Gói chính sách hỗ trợ tài chính khoa học công nghệ cho doanh nghiệp nhỏ và vừa (SME) được thực thi. Sức sống của khu vực kinh tế tư nhân năng động cất cánh." },
        onReject: { market: 20, equity: -25, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Cắt bỏ hoàn toàn các hỗ trợ để doanh nghiệp SME tự sinh tự diệt trước thị trường khốc liệt. Hàng loạt doanh nghiệp nhỏ phá sụp đổ hoàn toàn trước sức ép FDI ngoại." }
    },
    {
        id: "Q514",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #514",
        description: "Chính quyền địa phương đang chuẩn bị sửa đổi quy định về điều kiện kinh doanh đối với ngành dịch vụ. Qua rà soát, nhiều thủ tục được đánh giá là chồng chéo, không còn phù hợp, làm tăng chi phí và kéo dài thời gian gia nhập thị trường của doanh nghiệp. Đề xuất giải quyết: Rà soát và bãi bỏ các quy định bất hợp lý; hoàn thiện pháp luật về đầu tư, kinh doanh, bảo đảm quyền tự do kinh doanh và cạnh tranh lành mạnh theo quy định của pháp luật.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước phải xử lý các quy định chồng chéo, xóa bỏ rào cản bất hợp lý và hoàn thiện khuôn khổ pháp lý minh bạch, thông thoáng. Giữ nguyên hoặc bổ sung giấy phép không cần thiết sẽ làm tăng chi phí và cản trở gia nhập thị trường.",
            equity: "Nhà nước phải xử lý các quy định chồng chéo, xóa bỏ rào cản bất hợp lý và hoàn thiện khuôn khổ pháp lý minh bạch, thông thoáng. Giữ nguyên hoặc bổ sung giấy phép không cần thiết sẽ làm tăng chi phí và cản trở gia nhập thị trường.",
            discipline: "Nhà nước phải xử lý các quy định chồng chéo, xóa bỏ rào cản bất hợp lý và hoàn thiện khuôn khổ pháp lý minh bạch, thông thoáng. Giữ nguyên hoặc bổ sung giấy phép không cần thiết sẽ làm tăng chi phí và cản trở gia nhập thị trường."
        },
        onApprove: { market: 30, equity: -10, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Cải cách rà soát bãi bỏ các giấy phép con chồng chéo trong ngành dịch vụ. Khơi thông luồng vốn đầu tư chi phí tuân thủ của doanh nghiệp giảm mạnh rõ rệt." },
        onReject: { market: -25, equity: 10, discipline: 20, headline: "BÁO CHÍ ĐƯA TIN: Giữ nguyên toàn bộ các điều kiện kinh doanh phức tạp để bảo đảm quản lý an toàn. Làm nản lòng các nhà đầu tư kìm hãm cơ hội phát triển ngành dịch vụ công nghệ mới." }
    },
    {
        id: "Q515",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #515",
        description: "Một số địa phương đang có quy định và cách áp dụng pháp luật khác nhau đối với cùng một loại hình doanh nghiệp, khiến doanh nghiệp phản ánh về tình trạng thiếu thống nhất, khó mở rộng đầu tư giữa các địa phương. Đề xuất giải quyết: Thực hiện thống nhất một chế độ pháp lý kinh doanh đối với mọi doanh nghiệp, không phân biệt hình thức sở hữu hay thành phần kinh tế; bảo đảm mọi doanh nghiệp hoạt động theo cơ chế thị trường, bình đẳng và cạnh tranh lành mạnh theo pháp luật.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước phải áp dụng thống nhất một chế độ pháp lý, bảo đảm mọi doanh nghiệp bình đẳng và cạnh tranh lành mạnh theo pháp luật. Phân biệt đối xử hoặc ưu tiên một số thành phần kinh tế sẽ làm méo mó môi trường cạnh tranh và giảm niềm tin của doanh nghiệp.",
            equity: "Nhà nước phải áp dụng thống nhất một chế độ pháp lý, bảo đảm mọi doanh nghiệp bình đẳng và cạnh tranh lành mạnh theo pháp luật. Phân biệt đối xử hoặc ưu tiên một số thành phần kinh tế sẽ làm méo mó môi trường cạnh tranh và giảm niềm tin của doanh nghiệp.",
            discipline: "Nhà nước phải áp dụng thống nhất một chế độ pháp lý, bảo đảm mọi doanh nghiệp bình đẳng và cạnh tranh lành mạnh theo pháp luật. Phân biệt đối xử hoặc ưu tiên một số thành phần kinh tế sẽ làm méo mó môi trường cạnh tranh và giảm niềm tin của doanh nghiệp."
        },
        onApprove: { market: 25, equity: 15, discipline: -20, headline: "BÁO CHÍ ĐƯA TIN: Áp dụng nhất quán một chế độ pháp lý bình đẳng cho mọi thành phần kinh tế. Thị trường cạnh tranh lành mạnh củng cố niềm tin lớn cho các nhà đầu tư tư nhân." },
        onReject: { market: -20, equity: -25, discipline: 25, headline: "BÁO CHÍ ĐƯA TIN: Ban hành các khung ưu đãi pháp lý riêng biệt thiên vị cho từng nhóm doanh nghiệp. Làm méo mó thị trường cạnh tranh làm nản lòng dòng vốn đầu tư lành mạnh thực." }
    },
    {
        id: "Q516",
        title: "Vai trò kiến tạo và Môi trường vĩ mô của Nhà nước — Hồ sơ #516",
        description: "Để thúc đẩy tăng trưởng kinh tế, một địa phương dự kiến dành toàn bộ nguồn lực hỗ trợ cho các doanh nghiệp lớn vì cho rằng đây là lực lượng tạo ra giá trị cao nhất. Trong khi đó, nhiều hợp tác xã và doanh nghiệp nhỏ đang thiếu điều kiện phát triển. Đề xuất giải quyết: Hoàn thiện thể chế để các thành phần kinh tế phát triển đồng bộ; tạo điều kiện cho kinh tế tư nhân phát triển, đồng thời tăng cường các hình thức hợp tác, liên kết và hỗ trợ hợp tác xã, nông dân, doanh nghiệp nhỏ cùng tham gia thị trường.",
        correctAnswer: "Đồng ý",
        advisors: {
            market: "Nhà nước phải tạo điều kiện để các thành phần kinh tế phát triển đồng bộ, đồng thời hỗ trợ kinh tế tập thể, hợp tác xã, nông dân và doanh nghiệp nhỏ tham gia thị trường. Chỉ ưu tiên doanh nghiệp lớn sẽ làm mất cân đối và trái với yêu cầu phát triển hài hòa các khu vực kinh tế.",
            equity: "Nhà nước phải tạo điều kiện để các thành phần kinh tế phát triển đồng bộ, đồng thời hỗ trợ kinh tế tập thể, hợp tác xã, nông dân và doanh nghiệp nhỏ tham gia thị trường. Chỉ ưu tiên doanh nghiệp lớn sẽ làm mất cân đối và trái với yêu cầu phát triển hài hòa các khu vực kinh tế.",
            discipline: "Nhà nước phải tạo điều kiện để các thành phần kinh tế phát triển đồng bộ, đồng thời hỗ trợ kinh tế tập thể, hợp tác xã, nông dân và doanh nghiệp nhỏ tham gia thị trường. Chỉ ưu tiên doanh nghiệp lớn sẽ làm mất cân đối và trái với yêu cầu phát triển hài hòa các khu vực kinh tế."
        },
        onApprove: { market: 20, equity: 25, discipline: -15, headline: "BÁO CHÍ ĐƯA TIN: Hoàn thiện thể chế hỗ trợ liên kết hiệu quả giữa tập đoàn lớn và hợp tác xã nông thôn. Thành quả tăng trưởng lan tỏa rộng khắp nâng cao đời sống vùng quê nông nghiệp." },
        onReject: { market: 25, equity: -30, discipline: -10, headline: "BÁO CHÍ ĐƯA TIN: Dồn hết vốn ngân sách hỗ trợ các tập đoàn lớn làm đầu tàu kéo GDP bỏ mặc kinh tế hợp tác xã. GDP tăng nóng nhưng phân hóa giàu nghèo xã hội sâu sắc tăng cao." }
    },
];

// --- 3. LOGIC BUỔI TRƯA (XỬ LÝ HỒ SƠ) ---
// Xáo trộn mảng ngẫu nhiên (thuật toán Fisher-Yates)
function shuffleArray(arr) {
    let a = arr.slice(); 
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function startNoon() {
let nhacNen = document.getElementById("nhac-nen");
    if (nhacNen && nhacNen.paused) {
        nhacNen.play();
    }
    switchPhase(document.getElementById('phase-morning'), document.getElementById('phase-noon'));
    setDaytime('', 'Buổi Trưa', 'daytime-noon');

    // Đảm bảo nút và dấu mộc ở trạng thái sạch cho ngày mới
    document.getElementById('btn-approve').disabled = false;
    document.getElementById('btn-reject').disabled = false;
    document.getElementById('btn-advisor').disabled = false;
    let stamp = document.getElementById('stamp-overlay');
    stamp.classList.remove('stamp-show', 'stamp-approve', 'stamp-reject');
    document.getElementById('current-case').classList.remove('case-slide-out', 'case-slide-in');
    
    // Reset lịch sử vào đầu buổi làm việc
    document.getElementById('history-log').innerHTML = '<div class="log-item empty-log">Hệ thống sẵn sàng...</div>';
    
    let availableCases = caseDatabase.filter(c => !gameState.solvedCases.has(c.id));
    if (availableCases.length === 0) {
        alert("Bản demo đã hết hồ sơ! Hệ thống sẽ reset kho dữ liệu.");
        gameState.solvedCases.clear();
        availableCases = [...caseDatabase];
    }
    
    // Lấy 3 hồ sơ ngẫu nhiên
    gameState.todayCases = shuffleArray(availableCases).slice(0, 3);
    gameState.currentCaseIndex = 0;
    renderCurrentCase();
}

function renderCurrentCase() {
    let currentData = gameState.todayCases[gameState.currentCaseIndex];
    document.getElementById('case-title').innerText = `Hồ sơ #${gameState.currentCaseIndex + 1}: ${currentData.title}`;
    document.getElementById('case-desc').innerText = currentData.description;
}

function decideCase(isApproved) {
    let currentData = gameState.todayCases[gameState.currentCaseIndex];
    let impact = isApproved ? currentData.onApprove : currentData.onReject;

    // Khoá các nút trong lúc chạy animation để tránh bấm nhiều lần
    let btnApprove = document.getElementById('btn-approve');
    let btnReject = document.getElementById('btn-reject');
    let btnAdvisor = document.getElementById('btn-advisor');
    btnApprove.disabled = true;
    btnReject.disabled = true;
    btnAdvisor.disabled = true;

    // Hiện dấu mộc ĐÃ DUYỆT / ĐÃ BÁC BỎ giữa hồ sơ
    let stamp = document.getElementById('stamp-overlay');
    stamp.innerText = isApproved ? 'ĐÃ DUYỆT' : 'ĐÃ BÁC BỎ';
    stamp.classList.remove('stamp-approve', 'stamp-reject');
    stamp.classList.add(isApproved ? 'stamp-approve' : 'stamp-reject');
    playAnim(stamp, 'stamp-show');
    
    // Add shake to card
    let caseCard = document.getElementById('current-case');
    caseCard.classList.remove('shake');
    void caseCard.offsetWidth;
    caseCard.classList.add('shake');

    // Ghi log vào lịch sử NHƯNG ẨN ĐIỂM SỐ
    let actionText = isApproved ? "<strong style='color:var(--color-success);'><i data-lucide='check-circle' style='width:14px;height:14px;vertical-align:middle;'></i> DUYỆT</strong>" : "<strong style='color:var(--color-danger);'><i data-lucide='x-circle' style='width:14px;height:14px;vertical-align:middle;'></i> BÁC BỎ</strong>";
    addHistoryLog(`
        <div style="font-size: 12px; color: gray;">Ngày ${gameState.day} - ${currentData.id}</div>
        <div>Bạn đã <strong>${actionText}</strong> hồ sơ này.</div>
        <div style="font-size: 12px; font-style: italic; color: #7f8c8d;">(Hệ quả đang chờ phát tác...)</div>
    `);

    // Lưu biến động vào bộ nhớ tạm
    gameState.bufferStats.marketDynamics += impact.market;
    gameState.bufferStats.socialEquity += impact.equity;
    gameState.bufferStats.institutionalDiscipline += impact.discipline;

    gameState.pendingHeadlines.push(impact.headline);
    gameState.solvedCases.add(currentData.id);

    // Chờ xem dấu mộc xong rồi mới trượt hồ sơ ra và chuyển tiếp
    setTimeout(() => {
        let caseEl = document.getElementById('current-case');
        playAnim(caseEl, 'case-slide-out');

        setTimeout(() => {
            caseEl.classList.remove('case-slide-out');
            stamp.classList.remove('stamp-show', 'stamp-approve', 'stamp-reject');

            gameState.currentCaseIndex++;
            if (gameState.currentCaseIndex < gameState.todayCases.length) {
                renderCurrentCase();
                playAnim(caseEl, 'case-slide-in');
                btnApprove.disabled = false;
                btnReject.disabled = false;
                btnAdvisor.disabled = false;
            } else {
                startEvening();
            }
        }, 350);
    }, 850);
}

// --- 4. LOGIC HỎI CỐ VẤN ---
function openAdvisors() {
    let currentData = gameState.todayCases[gameState.currentCaseIndex];
    
    document.querySelector('#adv-market span').innerText = currentData.advisors.market;
    document.querySelector('#adv-equity span').innerText = currentData.advisors.equity;
    document.querySelector('#adv-discipline span').innerText = currentData.advisors.discipline;
    
    document.getElementById('advisor-modal').style.display = 'flex';
}

function closeAdvisors() {
    document.getElementById('advisor-modal').style.display = 'none';
}

// --- 5. LOGIC BUỔI TỐI (CHIA NGÂN SÁCH BẰNG NÚT +/-) ---
function startEvening() {
    switchPhase(document.getElementById('phase-noon'), document.getElementById('phase-evening'));
    setDaytime('', 'Buổi Tối', 'daytime-evening');
    
    // Reset điểm phân bổ về 0
    gameState.allocated = { market: 0, equity: 0, discipline: 0 };
    document.getElementById('alloc-market').innerText = 0;
    document.getElementById('alloc-equity').innerText = 0;
    document.getElementById('alloc-discipline').innerText = 0;
    document.getElementById('points-left').innerText = gameState.nightlyBudget;
}

function adjustPoints(type, delta) {
    let totalUsed = gameState.allocated.market + gameState.allocated.equity + gameState.allocated.discipline;
    
    // Nếu bấm (+) mà hết ngân sách -> bỏ qua (không hiện popup)
    if (delta > 0 && totalUsed >= gameState.nightlyBudget) return;
    
    // Nếu bấm (-) mà đang ở 0 -> bỏ qua (không xuống âm)
    if (delta < 0 && gameState.allocated[type] <= 0) return;
    
    // Cập nhật điểm phân bổ
    gameState.allocated[type] += delta;
    document.getElementById(`alloc-${type}`).innerText = gameState.allocated[type];
    
    // Tính lại điểm dư
    let newUsed = gameState.allocated.market + gameState.allocated.equity + gameState.allocated.discipline;
    document.getElementById('points-left').innerText = gameState.nightlyBudget - newUsed;
}

function endDay() {
    let alloc = gameState.allocated;
    
    // Ghi log điểm ban đêm
    if (alloc.market > 0 || alloc.equity > 0 || alloc.discipline > 0) {
        addHistoryLog(`
            <div style="font-size: 12px; color: gray;">Ngày ${gameState.day} - Đêm</div>
            <div>Phân bổ ngân sách dự phòng:</div>
            <div><i data-lucide="trending-up" style="width:14px;height:14px;vertical-align:middle;color:var(--color-market);"></i> ${formatImpact(alloc.market)} | <i data-lucide="scale" style="width:14px;height:14px;vertical-align:middle;color:var(--color-equity);"></i> ${formatImpact(alloc.equity)} | <i data-lucide="landmark" style="width:14px;height:14px;vertical-align:middle;color:var(--color-discipline);"></i> ${formatImpact(alloc.discipline)}</div>
        `);
    }

    // Cộng điểm cứu trợ
    gameState.stats.marketDynamics += alloc.market;
    gameState.stats.socialEquity += alloc.equity;
    gameState.stats.institutionalDiscipline += alloc.discipline;
    updateProgressBars();
    
    gameState.day++;
    startMorning();
}

// --- 6. LOGIC BUỔI SÁNG (NHẬN HẬU QUẢ & GAME OVER) ---
function startMorning() {
    let eveningEl = document.getElementById('phase-evening');
    if (eveningEl.style.display !== 'none') {
        eveningEl.classList.add('phase-fade-out');
        setTimeout(() => {
            eveningEl.style.display = 'none';
            eveningEl.classList.remove('phase-fade-out');
        }, 320);
    }
    
    // Ghi log hệ quả tổng hợp TRƯỚC KHI áp dụng và reset buffer
    if (gameState.day > 1) {
        addHistoryLog(`
            <div style="font-size: 12px; color: gray;">Đầu Ngày ${gameState.day}</div>
            <div><strong>Hệ quả các quyết định hôm qua bắt đầu phát tác:</strong></div>
            <div><i data-lucide="trending-up" style="width:14px;height:14px;vertical-align:middle;color:var(--color-market);"></i> ${formatImpact(gameState.bufferStats.marketDynamics)} | <i data-lucide="scale" style="width:14px;height:14px;vertical-align:middle;color:var(--color-equity);"></i> ${formatImpact(gameState.bufferStats.socialEquity)} | <i data-lucide="landmark" style="width:14px;height:14px;vertical-align:middle;color:var(--color-discipline);"></i> ${formatImpact(gameState.bufferStats.institutionalDiscipline)}</div>
        `);
    }
    
    // Áp dụng hệ quả từ ngày hôm qua
    gameState.stats.marketDynamics += gameState.bufferStats.marketDynamics;
    gameState.stats.socialEquity += gameState.bufferStats.socialEquity;
    gameState.stats.institutionalDiscipline += gameState.bufferStats.institutionalDiscipline;
    
    // Reset bộ đệm
    gameState.bufferStats = { marketDynamics: 0, socialEquity: 0, institutionalDiscipline: 0 };
    
    // Cập nhật Cột Hiện Tại & Progress Bar
    updateProgressBars();
    
    // KIỂM TRA SỤP ĐỔ
    let reason = checkGameOver();
    if (reason) {
        // Lưu lại kết quả để trang gameover.html đọc và hiển thị
        sessionStorage.setItem('macropieGameOver', JSON.stringify({
            day: gameState.day,
            reason: reason,
            stats: gameState.stats
        }));
        window.location.href = 'gameover.html';
        return;
    }
    
    // In báo cáo tờ báo
    document.getElementById('news-headline').innerText = `Ngày ${gameState.day}: Điểm tin`;
    
    if(gameState.pendingHeadlines.length > 0) {
        document.getElementById('news-details').innerHTML = gameState.pendingHeadlines.map(h => `<p>- ${h}</p>`).join('');
    } else {
        document.getElementById('news-details').innerHTML = "<p>Mọi thứ vẫn đang trong tầm kiểm soát.</p>";
    }
    
    gameState.pendingHeadlines = [];

    setDaytime('', 'Buổi Sáng', 'daytime-morning');
    setTimeout(() => {
        document.getElementById('phase-morning').style.display = 'block';
    }, 320);
}

function checkGameOver() {
    let s = gameState.stats;
    if (s.marketDynamics <= 0) return "Động lực Thị trường chạm đáy: Nền kinh tế rơi vào tình trạng đình trệ và đóng băng hoàn toàn.";
    if (s.marketDynamics >= 100) return "Động lực Thị trường cực đại: Nền kinh tế rơi vào trạng thái cơ chế thị trường tự phát, thiếu sự điều tiết vĩ mô.";
    if (s.socialEquity <= 0) return "Công bằng Xã hội chạm đáy: Các mâu thuẫn lợi ích tích tụ sâu sắc bùng phát thành các cuộc xung đột giai cấp gay gắt.";
    if (s.socialEquity >= 100) return "Công bằng Xã hội cực đại: Hệ thống rơi vào cái bẫy bình quân chủ nghĩa, triệt tiêu tinh thần thi đua.";
    if (s.institutionalDiscipline <= 0) return "Kỷ cương Thể chế chạm đáy: Nhà nước mất kiểm soát, kẽ hở lớn cho các nhóm lợi ích tiêu cực cấu kết lũng đoạn chính sách.";
    if (s.institutionalDiscipline >= 100) return "Kỷ cương Thể chế cực đại: Hệ thống rơi vào cơ chế quản lý kinh tế tập trung bao cấp, duy ý chí.";
    return null;
}

// --- 7. HÀM HỖ TRỢ LỊCH SỬ ---
function formatImpact(val) {
    if (val === 0) return `<span style="color:var(--text-muted);">0</span>`;
    return val > 0 ? `<span style="color:var(--color-success);font-weight:bold;">+${val}</span>` : `<span style="color:var(--color-danger);font-weight:bold;">${val}</span>`;
}

function addHistoryLog(htmlContent) {
    let logDiv = document.getElementById('history-log');
    
    if (logDiv.innerHTML.includes("Hệ thống sẵn sàng...")) {
        logDiv.innerHTML = "";
    }
    
    let entry = document.createElement('div');
    entry.className = 'log-item';
    entry.innerHTML = htmlContent;
    
    // Thêm lên đầu danh sách
    logDiv.prepend(entry);
}

function updateProgressBars() {
    let m = gameState.stats.marketDynamics;
    let e = gameState.stats.socialEquity;
    let d = gameState.stats.institutionalDiscipline;
    
    document.getElementById('val-market').innerText = m;
    document.getElementById('val-equity').innerText = e;
    document.getElementById('val-discipline').innerText = d;
    
    document.getElementById('bar-market').style.width = m + '%';
    document.getElementById('bar-equity').style.width = e + '%';
    document.getElementById('bar-discipline').style.width = d + '%';
    
    let dayDisplay = document.getElementById('current-day-display');
    if (dayDisplay) dayDisplay.innerText = gameState.day;


    let canhBao = false;

    // Kịch bản kiểm tra điều kiện rớt xuống < 20 hoặc vọt lên > 80[cite: 2]
    if (m < 20 || m > 80) {
        document.getElementById('bar-market').parentElement.classList.add("canh-bao");
        canhBao = true;
    } else {
        document.getElementById('bar-market').parentElement.classList.remove("canh-bao");
    }

    if (e < 20 || e > 80) {
        document.getElementById('bar-equity').parentElement.classList.add("canh-bao");
        canhBao = true;
    } else {
        document.getElementById('bar-equity').parentElement.classList.remove("canh-bao");
    }

    if (d < 20 || d > 80) {
        document.getElementById('bar-discipline').parentElement.classList.add("canh-bao");
        canhBao = true;
    } else {
        document.getElementById('bar-discipline').parentElement.classList.remove("canh-bao");
    }

    // Điều khiển loa cảnh báo
   // Điều khiển loa cảnh báo
    let loaCanhBao = document.getElementById("am-thanh-canh-bao");
    if (loaCanhBao) {
        if (canhBao) {
            // Nếu còi đang tắt thì bật lên, đồng thời hẹn giờ 3 giây sau tự động tắt
            if (loaCanhBao.paused) {
                loaCanhBao.play();
                
                setTimeout(function() {
                    loaCanhBao.pause();
                    loaCanhBao.currentTime = 0; // Trả băng băng về số 0 để lần sau kêu tiếp
                }, 3000); // 3000 mili-giây = 3 giây
            }
        } else {
            // Nếu an toàn thì tắt luôn còi
            loaCanhBao.pause();
            loaCanhBao.currentTime = 0;
        }
    }
}

// Init on load
window.onload = function() { updateProgressBars(); };

document.addEventListener('click', function(event) {
    // Kiểm tra xem người chơi có bấm vào thẻ <button> hoặc nằm trong nút bấm không
    let targetButton = event.target.closest('button');
    if (targetButton) {
        let clickAudio = document.getElementById("am-thanh-click");
        if (clickAudio) {
            clickAudio.currentTime = 0; // Tua về đầu để bấm liên tục vẫn kêu giòn giã
            clickAudio.play().catch(e => console.log("Click sound error:", e));
        }
    }
});
