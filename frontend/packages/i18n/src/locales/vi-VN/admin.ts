/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export default {
  admin: {
    common: {
      save: "Lưu",
      save_changes: "Lưu thay đổi",
      saving: "Đang lưu...",
      cancel: "Hủy",
      delete: "Xóa",
      remove: "Gỡ bỏ",
      add: "Thêm",
      create: "Tạo mới",
      edit: "Chỉnh sửa",
      back: "Quay lại",
      next: "Tiếp theo",
      submit: "Gửi",
      confirm: "Xác nhận",
      close: "Đóng",
      search: "Tìm kiếm",
      filter: "Lọc",
      loading: "Đang tải...",
      no_data: "Không có dữ liệu",
      yes: "Có",
      no: "Không",
      enabled: "Đang bật",
      disabled: "Đang tắt",
      active: "Đang hoạt động",
      inactive: "Tạm dừng",
      success: "Thành công",
      error: "Lỗi",
      warning: "Cảnh báo",
      required: "Bắt buộc",
      optional: "Tùy chọn",
    },

    sidebar: {
      general: "Cài đặt chung",
      email: "Email",
      authentication: "Xác thực",
      organizations: "Đơn vị",
      users: "Người dùng",
      ai: "Trí tuệ nhân tạo",
      images: "Hình ảnh",
      descriptions: {
        general: "Quản lý cài đặt và sở thích chung của hệ thống.",
        email: "Cấu hình SMTP để hệ thống gửi email.",
        authentication: "Cấu hình các phương thức xác thực và nhà cung cấp OAuth.",
        organizations: "Quản lý tất cả đơn vị trên hệ thống.",
        users: "Quản lý tài khoản người dùng trên hệ thống.",
        ai: "Cấu hình các tính năng trí tuệ nhân tạo.",
        images: "Cấu hình nhà cung cấp hình ảnh và tải lên cho QLCV.",
      },
    },

    header: {
      organization: "Đơn vị",
      user: "Người dùng",
      back_to_users: "Quay lại danh sách người dùng",
    },

    menu: {
      profile: "Hồ sơ",
      sign_out: "Đăng xuất",
      switch_to_app: "Chuyển sang ứng dụng",
    },

    page: {
      general: {
        title: "Cài đặt chung",
        description:
          "Đổi tên hệ thống và email quản trị. Bật/tắt báo cáo sử dụng cho hệ thống.",
        instance_details: "Thông tin hệ thống",
        instance_name: "Tên hệ thống",
        instance_name_placeholder: "QLCV EVNGENCO1",
        admin_email: "Email quản trị",
        admin_email_placeholder: "admin@evngenco1.vn",
        instance_id: "Mã hệ thống",
        company_name: "Tên công ty",
        telemetry_section: "Trò chuyện + Báo cáo sử dụng",
        chat_with_us: "Trò chuyện với chúng tôi",
        chat_with_us_desc:
          "Cho phép người dùng trò chuyện với chúng tôi qua Intercom hoặc dịch vụ tương tự. Tắt báo cáo sử dụng sẽ tự động tắt mục này.",
        telemetry_label: "Cho phép QLCV thu thập dữ liệu sử dụng ẩn danh",
        telemetry_desc:
          "Không thu thập thông tin định danh cá nhân. Dữ liệu ẩn danh này giúp hiểu cách bạn dùng QLCV và cải thiện sản phẩm.",
        telemetry_policy: "chính sách báo cáo sử dụng của chúng tôi.",
      },

      email: {
        title: "Cài đặt Email",
        description: "Cấu hình SMTP để hệ thống gửi email thông báo và đặt lại mật khẩu.",
        secure_emails_title: "Email an toàn từ hệ thống của bạn",
        secure_emails_description:
          "QLCV có thể gửi email hữu ích cho bạn và người dùng từ chính hệ thống mà không cần kết nối Internet.",
        secure_emails_warning:
          "Hãy thiết lập bên dưới và nhớ kiểm thử cấu hình trước khi lưu.",
        secure_emails_misconfig: "Cấu hình sai có thể khiến email bị bounce hoặc lỗi.",
        smtp_host: "Máy chủ SMTP",
        smtp_port: "Cổng SMTP",
        smtp_user: "Tài khoản SMTP",
        smtp_password: "Mật khẩu SMTP",
        from_address: "Địa chỉ email gửi đi",
        use_tls: "Dùng TLS",
        use_ssl: "Dùng SSL",
        send_test: "Gửi email thử",
        test_recipient: "Người nhận thử",
      },

      authentication: {
        title: "Quản lý phương thức xác thực",
        description:
          "Cấu hình các phương thức xác thực và giới hạn đăng ký chỉ qua lời mời.",
        allow_signup_label: "Cho phép đăng ký không cần lời mời",
        allow_signup_desc:
          "Tắt mục này sẽ chỉ cho phép người dùng đăng ký khi được mời.",
        available_methods: "Các phương thức xác thực khả dụng",
        unique_codes: "Mã đăng nhập một lần",
        unique_codes_desc:
          "Đăng nhập hoặc đăng ký bằng mã gửi qua email. Cần thiết lập SMTP để dùng được.",
        passwords: "Mật khẩu",
        passwords_desc:
          "Cho phép người dùng tạo tài khoản bằng mật khẩu và đăng nhập bằng địa chỉ email của mình.",
        google: "Google",
        github: "GitHub",
        gitlab: "GitLab",
        gitea: "Gitea",
        google_desc: "Cho phép người dùng đăng nhập hoặc đăng ký QLCV bằng tài khoản Google.",
        github_desc: "Cho phép người dùng đăng nhập hoặc đăng ký QLCV bằng tài khoản GitHub.",
        gitlab_desc: "Cho phép người dùng đăng nhập hoặc đăng ký QLCV bằng tài khoản GitLab.",
        gitea_desc: "Cho phép người dùng đăng nhập hoặc đăng ký QLCV bằng tài khoản Gitea.",
        configure: "Cấu hình",
      },

      ai: {
        title: "Tính năng AI cho mọi đơn vị",
        description:
          "Cấu hình API key để bật tính năng AI cho toàn bộ đơn vị trên hệ thống.",
        openai: "OpenAI",
        openai_desc: "Nếu bạn dùng ChatGPT, mục này dành cho bạn.",
        llm_model: "Model LLM",
        llm_model_help: "Chọn model OpenAI.",
        learn_more: "Tìm hiểu thêm",
        api_key: "API Key",
        api_key_help: "Bạn sẽ tìm thấy API key tại",
        api_key_link_text: "đây.",
        preferred_vendor:
          "Nếu bạn muốn dùng nhà cung cấp AI khác, hãy",
        contact_us: "liên hệ với chúng tôi.",
      },

      images: {
        title: "Thư viện hình ảnh bên thứ ba",
        description: "Cho phép người dùng tìm và chọn hình ảnh từ các thư viện bên thứ ba.",
        unsplash: "Unsplash",
        unsplash_access_key: "Access key tài khoản Unsplash của bạn",
        unsplash_help: "Bạn sẽ tìm thấy access key trong console developer của Unsplash.",
        learn_more: "Tìm hiểu thêm.",
      },

      organizations: {
        title: "Quản lý đơn vị",
        description: "Quản lý tất cả đơn vị trên hệ thống.",
        list_title: "Đơn vị trên hệ thống",
        no_organizations: "Chưa có đơn vị nào",
        create_button: "Tạo đơn vị mới",
        create_title: "Tạo đơn vị mới",
        create_description: "Tạo một đơn vị mới trên hệ thống.",
        name_label: "Tên đơn vị",
        name_placeholder: "VD: Cơ quan EVNGENCO1",
        slug_label: "Định danh URL",
        slug_placeholder: "vd: co-quan-evngenco1",
        company_size: "Quy mô công ty",
        members_count: "Số thành viên",
        projects_count: "Số phòng ban",
        created_at: "Ngày tạo",
        actions: "Hành động",
      },

      users: {
        title: "Quản lý người dùng",
        description: "Tạo và quản lý tài khoản người dùng trên hệ thống.",
        search_placeholder: "Tìm theo tên hoặc email...",
        all_roles: "Tất cả vai trò",
        super_admin_filter: "Quản trị tối cao",
        workspace_admin_filter: "Quản trị đơn vị",
        regular_user_filter: "Người dùng thường",
        users_count: "{count} người dùng",

        columns: {
          name: "Tên",
          username: "Tên đăng nhập",
          email: "Email",
          role: "Vai trò",
          status: "Trạng thái",
          last_active: "Hoạt động gần nhất",
          actions: "Hành động",
        },

        role: {
          super_admin: "Quản trị tối cao",
          workspace_admin: "Quản trị đơn vị",
          regular_user: "Người dùng thường",
          super_admin_desc: "Toàn quyền truy cập mọi cài đặt và mọi đơn vị.",
          workspace_admin_desc: "Quản trị viên của các đơn vị được gán.",
          regular_user_desc: "Không có quyền quản trị.",
          no_admin_privileges: "Không có quyền quản trị.",
          manages_units: "Quản lý các đơn vị:",
          no_units_assigned: "Chưa được gán đơn vị nào.",
        },

        status: {
          active: "Đang hoạt động",
          inactive: "Tạm dừng",
          password_reset_required: "Cần đổi mật khẩu",
        },

        actions: {
          import: "Nhập từ file",
          create_user: "Tạo người dùng",
          reset_password: "Đặt lại mật khẩu",
          activate: "Kích hoạt",
          deactivate: "Vô hiệu hóa",
          change_role: "Đổi vai trò",
          delete: "Xóa",
          search: "Tìm kiếm",
        },

        create: {
          title: "Tạo người dùng",
          description: "Tạo tài khoản người dùng mới và gán vào đơn vị.",
          username_label: "Tên đăng nhập",
          username_placeholder: "vd: huynq91",
          username_help: "3-64 ký tự, chỉ dùng chữ thường, số, dấu chấm, gạch ngang, gạch dưới.",
          email_label: "Email",
          email_placeholder: "user@example.com",
          first_name_label: "Tên",
          last_name_label: "Họ",
          organizations_label: "Đơn vị",
          organizations_help: "Giữ Ctrl/Cmd để chọn nhiều đơn vị.",
          role_in_organization_label: "Vai trò trong đơn vị",
          role_admin: "Quản trị",
          role_member: "Thành viên",
          role_guest: "Khách",
          submit: "Tạo người dùng",
          temp_password_title: "Mật khẩu tạm thời",
          temp_password_description: "Vui lòng lưu lại mật khẩu này — sẽ không hiển thị lại lần nữa.",
          copy_password: "Sao chép mật khẩu",
        },

        detail: {
          back: "Quay lại danh sách người dùng",
          loading: "Đang tải...",
          admin_role_section: "Vai trò quản trị",
          change_role: "Đổi vai trò",
          super_admin_question: "Quản trị tối cao",
          super_admin_no: "Không (người dùng thường / quản trị đơn vị)",
          super_admin_yes: "Có — Quản trị tối cao (toàn quyền hệ thống)",
          set_workspace_admin_help:
            "Để đặt người dùng làm Quản trị đơn vị, hãy đặt vai trò Admin trong mục Thành viên đơn vị bên dưới.",
          profile_section: "Hồ sơ",
          organization_memberships: "Thành viên đơn vị",
          not_a_member: "Chưa là thành viên đơn vị nào.",
          add_to_organization: "Thêm vào đơn vị",
          select_organization: "Chọn đơn vị...",
          project_memberships: "Thành viên phòng ban",
          account_info: "Thông tin tài khoản",
          email_verified: "Email đã xác thực",
          timezone: "Múi giờ",
          joined: "Tham gia",
          last_login: "Đăng nhập gần nhất",
        },

        import: {
          title: "Nhập người dùng hàng loạt",
          description: "Nhập nhiều người dùng cùng lúc từ file CSV hoặc XLSX.",
          download_template: "Tải file mẫu CSV",
          upload_label: "Tải lên CSV/XLSX",
          drop_file: "Kéo thả file vào đây hoặc bấm để chọn",
          processing: "Đang xử lý...",
          created_count: "Đã tạo {count} người dùng",
          errors_count: "{count} lỗi",
          row: "Dòng",
          email: "Email",
          error: "Lỗi",
        },

        toast: {
          created_success: "Tạo người dùng thành công",
          created_error: "Tạo người dùng thất bại",
          updated_success: "Cập nhật người dùng thành công",
          updated_error: "Cập nhật người dùng thất bại",
          password_reset_success: "Đặt lại mật khẩu thành công",
          password_reset_error: "Đặt lại mật khẩu thất bại",
          activated: "Đã kích hoạt người dùng",
          deactivated: "Đã vô hiệu hóa người dùng",
          role_updated: "Đã cập nhật vai trò",
          assigned_to_organization: "Đã thêm vào đơn vị",
          removed_from_organization: "Đã gỡ khỏi đơn vị",
          import_success: "Nhập người dùng thành công",
        },
      },
    },

    popup: {
      welcome_title: "Chào mừng đến với Cổng quản trị QLCV",
      welcome_description:
        "Hệ thống đã được cài đặt xong! Bắt đầu hành trình bằng cách tạo đơn vị đầu tiên của bạn.",
      create_organization: "Tạo đơn vị",
    },
  },
};
