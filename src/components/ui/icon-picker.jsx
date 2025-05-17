import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

const icons = [
  { name: "FolderIcon", icon: "FolderIcon" },
  { name: "HomeIcon", icon: "HomeIcon" },
  { name: "BriefcaseIcon", icon: "BriefcaseIcon" },
  { name: "HeartIcon", icon: "HeartIcon" },
  { name: "StarIcon", icon: "StarIcon" },
  { name: "BookmarkIcon", icon: "BookmarkIcon" },
  { name: "FlagIcon", icon: "FlagIcon" },
  { name: "TagIcon", icon: "TagIcon" },
  { name: "CalendarIcon", icon: "CalendarIcon" },
  { name: "ClockIcon", icon: "ClockIcon" },
  { name: "BellIcon", icon: "BellIcon" },
  { name: "CheckCircleIcon", icon: "CheckCircleIcon" },
  { name: "AlertCircleIcon", icon: "AlertCircleIcon" },
  { name: "HelpCircleIcon", icon: "HelpCircleIcon" },
  { name: "InfoIcon", icon: "InfoIcon" },
  { name: "SettingsIcon", icon: "SettingsIcon" },
  { name: "UserIcon", icon: "UserIcon" },
  { name: "UsersIcon", icon: "UsersIcon" },
  { name: "MessageSquareIcon", icon: "MessageSquareIcon" },
  { name: "MailIcon", icon: "MailIcon" },
  { name: "PhoneIcon", icon: "PhoneIcon" },
  { name: "MapPinIcon", icon: "MapPinIcon" },
  { name: "NavigationIcon", icon: "NavigationIcon" },
  { name: "CompassIcon", icon: "CompassIcon" },
  { name: "GlobeIcon", icon: "GlobeIcon" },
  { name: "CloudIcon", icon: "CloudIcon" },
  { name: "SunIcon", icon: "SunIcon" },
  { name: "MoonIcon", icon: "MoonIcon" },
  { name: "CoffeeIcon", icon: "CoffeeIcon" },
  { name: "MusicIcon", icon: "MusicIcon" },
  { name: "VideoIcon", icon: "VideoIcon" },
  { name: "ImageIcon", icon: "ImageIcon" },
  { name: "FileIcon", icon: "FileIcon" },
  { name: "FileTextIcon", icon: "FileTextIcon" },
  { name: "FileCodeIcon", icon: "FileCodeIcon" },
  { name: "FileImageIcon", icon: "FileImageIcon" },
  { name: "FileAudioIcon", icon: "FileAudioIcon" },
  { name: "FileVideoIcon", icon: "FileVideoIcon" },
  { name: "FileArchiveIcon", icon: "FileArchiveIcon" },
  { name: "FileSpreadsheetIcon", icon: "FileSpreadsheetIcon" },
  { name: "FileJsonIcon", icon: "FileJsonIcon" },
]

const colors = [
  { name: "默认", value: "default" },
  { name: "红色", value: "red" },
  { name: "橙色", value: "orange" },
  { name: "黄色", value: "yellow" },
  { name: "绿色", value: "green" },
  { name: "蓝色", value: "blue" },
  { name: "紫色", value: "purple" },
  { name: "粉色", value: "pink" },
]

export function IconPicker({ value, onChange }) {
  const [selectedIcon, setSelectedIcon] = useState(value?.icon || "FolderIcon")
  const [selectedColor, setSelectedColor] = useState(value?.color || "default")
  const [isOpen, setIsOpen] = useState(false)

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon)
    onChange({ icon, color: selectedColor })
  }

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    onChange({ icon: selectedIcon, color })
  }

  const getColorClass = (color) => {
    switch (color) {
      case "red":
        return "text-red-500"
      case "orange":
        return "text-orange-500"
      case "yellow":
        return "text-yellow-500"
      case "green":
        return "text-green-500"
      case "blue":
        return "text-blue-500"
      case "purple":
        return "text-purple-500"
      case "pink":
        return "text-pink-500"
      default:
        return "text-foreground"
    }
  }

  const SelectedIcon = Icons[selectedIcon] || Icons.FolderIcon

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <SelectedIcon className={cn("h-4 w-4", getColorClass(selectedColor))} />
          <span>选择图标</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <SelectedIcon className={cn("h-6 w-6", getColorClass(selectedColor))} />
            <span className="text-sm font-medium">当前选择</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">颜色</label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map(({ name, value }) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      selectedColor === value && "border-primary",
                      value === "default" && "bg-background",
                      value === "red" && "bg-red-500",
                      value === "orange" && "bg-orange-500",
                      value === "yellow" && "bg-yellow-500",
                      value === "green" && "bg-green-500",
                      value === "blue" && "bg-blue-500",
                      value === "purple" && "bg-purple-500",
                      value === "pink" && "bg-pink-500"
                    )}
                    onClick={() => handleColorSelect(value)}
                  >
                    {selectedColor === value && (
                      <span className="sr-only">{name}</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">图标</label>
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                {icons.map(({ name, icon }) => {
                  const Icon = Icons[icon]
                  return (
                    <Button
                      key={name}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        selectedIcon === icon && "border-primary"
                      )}
                      onClick={() => handleIconSelect(icon)}
                    >
                      <Icon className={cn("h-4 w-4", getColorClass(selectedColor))} />
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}