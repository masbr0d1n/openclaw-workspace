export interface TabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: React.ReactNode;
}
