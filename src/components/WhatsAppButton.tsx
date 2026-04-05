import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/963934436980"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="WhatsApp"
    >
      <MessageCircle size={28} className="text-primary-foreground" />
    </a>
  );
};

export default WhatsAppButton;
