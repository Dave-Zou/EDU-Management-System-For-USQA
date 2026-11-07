# 教务管理系统原型：以代码为准

仓库 `EDU-Management-System-For-USQA`，包名 `edu-system`。下面描述的是编写 skill 时 `main` 上的代码，不是 `.trae/documents/prd.md` 或 `technical-architecture.md`。两份文档已过时：PRD 没有申诉、考试安排、用户管理和自助注册；架构文档写的是 Vite 6 和 React Context，代码是 Vite 5 和 zustand。

本文件只描述这个原型实际做什么。2026 年 10 月的辅导把被评分的实现说成 C#，stage 2 另有 ORM 的要求，见 `center-notes.md`。任务书没有明确接受这个网页之前，设计、测试和评价对着被评分的那份代码；本文件用来核对成绩、角色和申诉应该表现出的行为，以及这个原型真实的缺口。代码有改动，先改本文件再改报告。

## 运行形态

- React 18、TypeScript、Vite 5、Tailwind 3、React Router 6、zustand 4、lucide-react
- 没有后端。登录态经 zustand `persist` 写入 localStorage（键 `auth-storage`）
- 成绩、课表、申诉、考试、用户管理都在内存 store 里，刷新页面会丢，只有登录态还在
- 启动：`npm run dev`。构建：`npm run build`（`tsc` 之后 `vite build`）

演示账号都在 `src/data/mockData.ts`，密码都是 `123456`。这是教学原型的测试数据。

| 身份 | 用户名 | 角色字段 | 范围 |
|---|---|---|---|
| 学生 张三 | 2024001 | student | 班级 c001 |
| 学生 李四 | 2024002 | student | 班级 c001 |
| 学生 王五 | 2024003 | student | 班级 c002 |
| 学生 赵六 | 2024004 | student | 班级 c002 |
| 任课老师 孙老师 | t001 | teacher | 计算机学院 |
| 任课老师 李老师 | t002 | teacher | 数学系 |
| 班主任 王班主任 | t003 | homeroom_teacher | 班级 c001 |
| 班主任 张班主任 | t004 | homeroom_teacher | 班级 c002 |
| 教务 | admin | admin | 无班级 |

登录页只有三种身份卡片：学生、老师、教务。选「老师」时，账号可以是任课老师或班主任，角色看账号本身。

## 路由与权限

权限在 `src/App.tsx` 的 `requireRole`。不满足则送回 `/dashboard`。未登录送回 `/`。

| 路径 | 谁能进 | 做什么 |
|---|---|---|
| `/` | 所有人 | 登录；学生自助注册（见缺陷） |
| `/dashboard` | 已登录 | 首页 |
| `/grades` | 已登录 | 查成绩 |
| `/grades/register` | admin、teacher | 登记成绩 |
| `/grades/edit/:id` | 仅 admin | 修改成绩 |
| `/grades/review` | admin、homeroom_teacher | 复核。任课老师不能复核 |
| `/schedule` | 已登录 | 看课表 |
| `/schedule/arrange` | 仅 admin | 排课、改课、删课 |
| `/appeals` | 已登录 | 申诉。学生看自己的；处理权限在页面里再判断 |
| `/exam` | 仅 admin | 考试安排 |
| `/users` | 仅 admin | 用户管理 |
| `/profile` | 已登录 | 个人资料；修改密码是未完成的 |

侧栏与上表一致：任课老师多一个「登记成绩」，班主任多一个「复核成绩」，教务另外有登记、复核、排课、考试、用户管理。学生侧栏没有这些入口。直接输入 URL 仍会被 `requireRole` 拦住。

## 业务规则（代码里真正执行的）

**成绩。** 状态 `pending | reviewed | rejected`。登记时用 `getGradeLevel`：≥90 优秀，≥80 良好，≥70 中等，≥60 及格，其余不及格。修改分数会重算等级。复核可以单条或批量，评论写入 `reviewComment`。

**申诉。** 状态 `pending | reviewing | approved | rejected`。提交时 `authCode` 必须是 `TEACHER123`、`ADMIN456`、`AUTH789` 之一，否则 `addAppeal` 返回 false，不创建记录。班主任、任课老师、教务审核时，评论分别进 `homeroomComment`、`teacherComment`、`adminComment`。申诉列表初始是空数组，种子数据里没有申诉。

**课表。** 按班级、教师、星期过滤。新增、修改、删除都有。没有冲突检测。

**考试。** 类型 `midterm | final | quiz | practice`。只有新增和删除。

**用户。** 用户名重复则拒绝新增。注册页面还收集身份证号和确认密码，但 `addUser` 只接收姓名、用户名、密码、角色、班级。

**登录。** `useAuthStore.login` 只在 `mockUsers` 里查找，不读用户管理 store。

## 建议放进顶层用例模型的用户目标

这些是现在代码支持或半支持的目标，供 Planning 的初版用例模型起稿。任务书若缩小范围，删掉任务书不要的；任务书若要求额外目标，加进去并在开发阶段实现，不要只加在图上。

1. 登录、退出
2. 学生注册账号（当前失败，见下）
3. 按角色查询成绩
4. 任课老师或教务登记成绩
5. 教务修改成绩
6. 班主任或教务复核成绩（通过或退回）
7. 学生提交成绩申诉（需要授权码）
8. 班主任、任课老师或教务处理申诉
9. 查看课表
10. 教务排课、调整、删除
11. 教务安排或删除考试
12. 教务管理用户
13. 查看个人资料、修改密码（当前失败，见下）

用例名用动词短语，actor 用上面四种角色，不要用人名，也不要把 localStorage 画成 actor。系统边界用「教务管理系统」。

## 设计时要守住的数据

`src/types/index.ts` 是静态模型的来源。类或实体至少覆盖 User、Grade、Schedule、Course、Class、Appeal、Exam。Major 只出现在用户管理的常量里。

关系：学生属于班级；班主任负责班级；成绩连接学生、班级、课程、任课老师；课表和考试同样连接班级、课程、教师；申诉指向一条成绩，并保留原始分与申请分。多重性按这些外键写，不要发明代码里没有的「学院实体」，除非设计明确说它将要被实现，并在开发里真的加上。

成绩等级是由分数派生的值，不是用户另选的枚举。设计里写成派生规则。

## 已知缺陷

测试计划和评价必须面对这些，不能写成已完成。

1. **注册不能登录。** 注册调用 `useUserManagementStore.addUser`，登录只查 `mockUsers`。身份证号不进入用户记录。
2. **修改密码是空操作。** `Profile.tsx` 只接受旧密码字面量 `123456`，成功后只弹窗，不写回任何用户。其他演示账号如果密码不是这个字面量，也会被拒。
3. **考试种子数据的标识是另一套。** `useStore.ts` 里的 `mockExams` 使用 `C001`、`CL001`、`T001`、班级名「2024级计算机1班」。主数据是 `course001`、`c001`、`t001`、班级名「计算机2401班」。考试和课程、班级对不上。
4. **持久化不完整。** 刷新后成绩、课表、申诉、新用户都回到初始状态。申诉回到空列表。
5. **两份用户名单。** `useGradeStore.users` 与 `useUserManagementStore.users` 各自持有 `mockUsers` 的副本，之后不再同步。
6. **密码明文**随用户对象进入内存，并随登录态进入 localStorage。
7. **排课不检查**同一班级、教师或教室的时间冲突。
8. **文档与实现不一致**，见本文件开头。若 Action Plan 引用了 PRD，要注明 PRD 是早期草稿。

第 1、2、3 条适合作为 Developing 的失败测试用例，也适合作为 Evaluating 的缺点。修它们属于开发阶段的范围，而且修完要回归：新注册学生能登录、修改后的密码能登录、考试能关联到真实课程和班级。
