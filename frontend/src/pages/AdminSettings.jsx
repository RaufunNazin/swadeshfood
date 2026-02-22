import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../api";
import { toast } from "react-toastify";
import {
  Card,
  Input,
  Switch,
  Button,
  Form,
  Spin,
  ConfigProvider,
  theme as antdTheme,
  Select,
} from "antd";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useStoreSettings } from "../contexts/StoreSettingsContext";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStore, setSavingStore] = useState(false);

  const [form] = Form.useForm();
  const [storeForm] = Form.useForm();

  const { theme } = useTheme();
  const { t } = useLanguage();

  // ✅ important: refresh global store settings after saving delivery settings
  const { refreshStoreSettings } = useStoreSettings();

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = () => {
    setLoading(true);

    // Notification settings
    api
      .get("/admin/notification")
      .then((res) => {
        form.setFieldsValue({
          text_en: res.data.text_en,
          text_bn: res.data.text_bn,
          is_active: res.data.is_active === 1,
          is_highlighted: res.data.is_highlighted === 1,
          notif_type: res.data.notif_type || "info",
        });
      })
      .catch(() => {
        toast.error(t("load_settings_failed") || "Failed to load settings");
      })
      .finally(() => {
        setLoading(false);
      });

    // Store settings (delivery)
    api
      .get("/admin/store-settings")
      .then((res) => {
        storeForm.setFieldsValue({
          delivery_charge: res.data.delivery_charge,
          free_delivery_threshold: res.data.free_delivery_threshold,
        });
      })
      .catch(() => {
        toast.error(t("load_settings_failed") || "Failed to load settings");
      });
  };

  const handleSave = (values) => {
    setSaving(true);

    const payload = {
      text_en: values.text_en,
      text_bn: values.text_bn,
      is_active: values.is_active ? 1 : 0,
      is_highlighted: values.is_highlighted ? 1 : 0,
      notif_type: values.notif_type,
    };

    api
      .put("/admin/notification", payload)
      .then(() => {
        toast.success(
          t("notification_updated") || "Notification updated successfully!",
        );
      })
      .catch(() => {
        toast.error(
          t("notification_update_failed") || "Failed to update notification",
        );
      })
      .finally(() => setSaving(false));
  };

  const handleSaveStoreSettings = async (values) => {
    setSavingStore(true);

    // Ensure numbers are sent as numbers (backend-dependent, but safer)
    const payload = {
      delivery_charge: Number(values.delivery_charge),
      free_delivery_threshold: Number(values.free_delivery_threshold),
    };

    try {
      await api.put("/admin/store-settings", payload);

      // ✅ refresh the global context so Navbar/Cart/Checkout update immediately
      await refreshStoreSettings();

      toast.success(t("settings_updated") || "Store settings updated!");
    } catch (e) {
      toast.error(t("settings_update_failed") || "Failed to update settings");
    } finally {
      setSavingStore(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <AdminLayout title={t("store_settings") || "Store Settings"}>
        <div className="max-w-2xl">
          <Card
            title={t("top_notification_banner") || "Top Notification Banner"}
            className="shadow-sm rounded-xl border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
          >
            {loading ? (
              <div className="flex justify-center p-6">
                <Spin />
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleSave}>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="is_active"
                    valuePropName="checked"
                    label={
                      <span className="dark:text-neutral-300">
                        {t("show_banner_website") || "Show Banner"}
                      </span>
                    }
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="is_highlighted"
                    valuePropName="checked"
                    label={
                      <span className="dark:text-neutral-300">
                        {t("highlight_banner") || "Blink Banner"}
                      </span>
                    }
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <Form.Item
                  name="notif_type"
                  label={
                    <span className="dark:text-neutral-300">
                      {t("notif_type") || "Notification Type"}
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Select.Option value="info">
                      {t("type_info") || "Info"}
                    </Select.Option>
                    <Select.Option value="success">
                      {t("type_success") || "Success"}
                    </Select.Option>
                    <Select.Option value="warning">
                      {t("type_warning") || "Warning"}
                    </Select.Option>
                    <Select.Option value="urgent">
                      {t("type_urgent") || "Urgent"}
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="text_en"
                  label={
                    <span className="dark:text-neutral-300">
                      {t("english_text") || "English Text"}
                    </span>
                  }
                  rules={[{ required: true, message: t("enter_english_text") }]}
                >
                  <Input
                    placeholder={t("english_text_placeholder")}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="text_bn"
                  label={
                    <span className="dark:text-neutral-300">
                      {t("bangla_text") || "Bangla Text"}
                    </span>
                  }
                  rules={[{ required: true, message: t("enter_bangla_text") }]}
                >
                  <Input
                    placeholder={t("bangla_text_placeholder")}
                    size="large"
                  />
                </Form.Item>

                <Form.Item className="mb-0 mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    size="large"
                    className="bg-green-600 hover:bg-green-700 border-none px-8"
                  >
                    {t("save_changes") || "Save Changes"}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>

          <Card
            title={t("delivery_settings") || "Delivery Settings"}
            className="shadow-sm rounded-xl border-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 mt-8"
          >
            <Form
              form={storeForm}
              layout="vertical"
              onFinish={handleSaveStoreSettings}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="delivery_charge"
                  label={
                    <span className="dark:text-neutral-300">
                      {t("delivery_charge") || "Standard Delivery Charge (৳)"}
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Input type="number" size="large" />
                </Form.Item>

                <Form.Item
                  name="free_delivery_threshold"
                  label={
                    <span className="dark:text-neutral-300">
                      {t("free_delivery_threshold") ||
                        "Free Delivery Threshold (৳)"}
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Input type="number" size="large" />
                </Form.Item>
              </div>

              <Form.Item className="mb-0 mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={savingStore}
                  size="large"
                  className="bg-green-600 hover:bg-green-700 border-none px-8"
                >
                  {t("save_changes") || "Save Changes"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </AdminLayout>
    </ConfigProvider>
  );
};

export default AdminSettings;
