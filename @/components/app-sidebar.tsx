'use client'

import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  EggIcon,
  CastleIcon,
  Laptop2Icon,
  LaptopIcon,
  SmilePlusIcon,
  SparkleIcon,
  SparklesIcon,
  HomeIcon,
  WorkflowIcon,
  Building2,
  SquareActivity,
  LayoutDashboard,
  SquareDashedBottom,
  LucideLayoutDashboard
} from 'lucide-react'
import { navigate } from 'wouter/use-browser-location'
import { useHome } from '@renderer/ui/HyperHome/useHome'

// import { DiamondCanvas } from '@renderer/ui/workspace/3d/DiamondTSL/DiamondCanvas'

// import { AuraExample } from '@renderer/effects/AuraExample'
// import { SearchBar } from '@renderer/effects/SearchBar'

// import electronSVG from '../../src/renderer/src/assets/electron.svg'
// import { AuraExample } from '@renderer/effects/AuraExample'
// import { AuraEffect } from '@renderer/effects/AuraEffect'
// import { SearchBar } from '@renderer/effects/SearchBar'
/*

    [
      {
        name: 'Work Projects',
        logo: <GalleryVerticalEndIcon />,
        plan: 'Startup'
      },
      {
        name: 'Home Projects',
        logo: <AudioLinesIcon />,
        plan: 'Startup'
      },
      {
        name: 'Side Projects',
        logo: <TerminalIcon />,
        plan: 'Startup'
      }
    ]

*/

// This is sample data.
// const data = {
//   user: {
//     name: 'Long Time AI',
//     email: 'Cognitive Offload',
//     avatar: '/avatars/shadcn.jpg'
//   },
//   teams: [
//     {
//       name: 'Work Projects',
//       logo: <GalleryVerticalEndIcon />,
//       plan: 'Startup'
//     },
//     {
//       name: 'Home Projects',
//       logo: <AudioLinesIcon />,
//       plan: 'Startup'
//     },
//     {
//       name: 'Side Projects',
//       logo: <TerminalIcon />,
//       plan: 'Startup'
//     }
//   ],
//   navMain: [
//     {
//       title: 'Playground',
//       url: '#',
//       icon: <TerminalSquareIcon />,
//       isActive: true,
//       items: [
//         {
//           title: 'Setup AI Engine',
//           url: '/setup'
//         },
//         {
//           title: 'Home',
//           url: '/home'
//         },
//         {
//           title: 'Use Skills',
//           url: '/skills'
//         },
//         {
//           title: 'Recursive AI',
//           url: '/recursive-ai'
//         }
//       ]
//     },
//     {
//       title: 'Models',
//       url: '#',
//       icon: <BotIcon />,
//       items: [
//         {
//           title: 'Genesis',
//           url: '#'
//         },
//         {
//           title: 'Explorer',
//           url: '#'
//         },
//         {
//           title: 'Quantum',
//           url: '#'
//         }
//       ]
//     },
//     {
//       title: 'Documentation',
//       url: '#',
//       icon: <BookOpenIcon />,
//       items: [
//         {
//           title: 'Introduction',
//           url: '#'
//         },
//         {
//           title: 'Get Started',
//           url: '#'
//         },
//         {
//           title: 'Tutorials',
//           url: '#'
//         },
//         {
//           title: 'Changelog',
//           url: '#'
//         }
//       ]
//     },
//     {
//       title: 'Settings',
//       url: '#',
//       icon: <Settings2Icon />,
//       items: [
//         {
//           title: 'General',
//           url: '#'
//         },
//         {
//           title: 'Team',
//           url: '#'
//         },
//         {
//           title: 'Billing',
//           url: '#'
//         },
//         {
//           title: 'Limits',
//           url: '#'
//         }
//       ]
//     }
//   ],
//   projects: [
//     {
//       name: 'Design Engineering',
//       url: '#',
//       icon: <FrameIcon />
//     },
//     {
//       name: 'Sales & Marketing',
//       url: '#',
//       icon: <PieChartIcon />
//     },
//     {
//       name: 'Travel',
//       url: '#',
//       icon: <MapIcon />
//     }
//   ]
// }

export function AppSidebar({
  name = '',
  ...props
}: React.ComponentProps<typeof Sidebar> & { name?: string }) {
  //

  let [workspaces, setWorkspaces] = React.useState([])
  let [mainMenu, setMainMenu] = React.useState([])
  let [subMenu, setSubMenu] = React.useState([])

  //

  React.useEffect(() => {
    let reload = () => {
      const controller = window.api.askAI(
        {
          route: 'listWorkspaces'
        },
        (stream) => {
          //
          const resp = JSON.parse(stream)
          console.log(resp)
        }
      )

      controller.getDataAsync().then((data) => {
        //

        //
        setWorkspaces(
          data.workspaces.map((item) => {
            let icon = <LucideLayoutDashboard />
            if (item.name.toLowerCase() === 'personal') {
              icon = <HomeIcon></HomeIcon>
            }
            if (item.name.toLowerCase() === 'work') {
              icon = <Building2></Building2>
            }
            return {
              active: item.name === name,
              name: item.name,
              logo: icon,
              plan: `Workspace`
            }
          })
        )

        useHome.setState({
          workspace: name
        })

        useHome
          .getState()
          .loadFolderConfig({})
          .then((folder) => {
            //
            console.log(folder)
            if (folder) {
              setMainMenu([
                {
                  title: 'AI Workspace',
                  url: '#',
                  icon: <TerminalSquareIcon />,
                  isActive: true,
                  //
                  items: [
                    {
                      title: 'Files',
                      url: `/workspace/${name}/files`
                    },
                    {
                      title: 'Settings',
                      url: `/workspace/${name}/settings`
                    },

                    {
                      title: 'CLI Builder',
                      url: `/workspace/${name}/cli-builder`
                    }
                  ]
                }
              ])
            } else {
              setMainMenu([
                {
                  title: 'AI Workspace',
                  url: '#',
                  icon: <TerminalSquareIcon />,
                  isActive: true,
                  //
                  items: [
                    {
                      title: 'Workspace Setup',
                      url: `/workspace/${name}/settings`
                    },

                    {
                      title: 'CLI Builder',
                      url: `/workspace/${name}/cli-builder`
                    }
                  ]
                }
              ])
            }
            //
          })

        // {
        //   title: 'Models',
        //   url: '#',
        //   icon: <BotIcon />,
        //   items: [
        //     {
        //       title: 'Genesis',
        //       url: '#'
        //     },
        //     {
        //       title: 'Explorer',
        //       url: '#'
        //     },
        //     {
        //       title: 'Quantum',
        //       url: '#'
        //     }
        //   ]
        // },
        // {
        //   title: 'Documentation',
        //   url: '#',
        //   icon: <BookOpenIcon />,
        //   items: [
        //     {
        //       title: 'Introduction',
        //       url: '#'
        //     },
        //     {
        //       title: 'Get Started',
        //       url: '#'
        //     },
        //     {
        //       title: 'Tutorials',
        //       url: '#'
        //     },
        //     {
        //       title: 'Changelog',
        //       url: '#'
        //     }
        //   ]
        // },
        //
        // {
        //   title: 'Settings',
        //   url: '#',
        //   icon: <Settings2Icon />,
        //   items: [
        //     {
        //       title: 'General',
        //       url: '#'
        //     },
        //     {
        //       title: 'Team',
        //       url: '#'
        //     },
        //     {
        //       title: 'Billing',
        //       url: '#'
        //     },
        //     {
        //       title: 'Limits',
        //       url: '#'
        //     }
        //   ]
        // }
        setSubMenu([
          {
            name: 'LMStudio AI',
            url: `/workspace/${name}/setup`,
            icon: <BotIcon />
          }

          // {
          //   name: 'Sales & Marketing',
          //   url: '#',
          //   icon: <PieChartIcon />
          // },

          // {
          //   name: 'Travel',
          //   url: '#',
          //   icon: <MapIcon />
          // }
        ])

        //
      })
    }

    //

    reload()

    //

    window.addEventListener('reload-workspaces', reload)

    let timer = setInterval(() => {
      //

      const controller = window.api.askAI(
        {
          route: 'checkWorkspace',
          folderName: name
        },
        (stream) => {
          //
          const resp = JSON.parse(stream)
          console.log(resp)
        }
      )

      controller.getDataAsync().then((data) => {
        if (data.exist === true) {
        } else {
          navigate('/')
        }
      })

      //
    }, 1500)

    return () => {
      clearInterval(timer)
      window.removeEventListener('reload-workspaces', reload)
    }
  }, [name])

  return (
    <Sidebar collapsible="none" {...props} className="relative h-screen">
      <>{/* <img src={electronSVG} /> */}</>

      <div className=" relative">
        <SidebarHeader>
          <TeamSwitcher key={JSON.stringify(workspaces)} teams={workspaces} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={mainMenu} />
          <NavProjects projects={subMenu} />
        </SidebarContent>

        <SidebarFooter className="h-full">
          {/* <NavUser
            user={{
              name: 'HyperEgg AI Folder',
              email: 'AI Smart Folder',
              avatar: '/avatars/shadcn.jpg'
            }}
          /> */}
        </SidebarFooter>
        {/* <SidebarRail /> */}
      </div>
    </Sidebar>
  )
}
