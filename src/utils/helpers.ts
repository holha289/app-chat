
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
}

export default Helpers;