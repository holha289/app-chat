
class Helpers {
    static formatDate = (date: string | null | undefined): string => {
        if (!date) return "Không có thông tin";
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    static getGenderText = (gender: string | null | undefined): string => {
        if (!gender) return "Khác";
        if (gender === 'male') {
            return "Nam";
        } else if (gender === 'female') {
            return "Nữ";
        }
        return "Khác";
    }

    static formatTime = (duration: number): string => {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    static checkExpiresIn(expiresIn: number): boolean {
        const date = new Date(expiresIn);

        // Trừ đi 1 ngày
        const oneDayMs = 24 * 60 * 60 * 1000;
        const prevDate = new Date(date.getTime() - oneDayMs);
        // So sánh với ngày hiện tại
        const now = new Date();

        // Nếu ngày hiện tại lớn hơn hoặc bằng ngày hết hạn đã trừ 1 ngày
        if (now >= prevDate) {
            return true;
        }
        return false;
    }
}

export default Helpers;