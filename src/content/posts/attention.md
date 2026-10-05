---
title: 并发相关面试题同心协力！！
summary: 我们每天看见太多，却很少真正看见。关于屏幕、目光，以及如何把注意力还给自己的一次小小练习。
category: 设计观察
publishedAt: 2026-10-03
readingMinutes: 8
views: 0
featured: true
draft: false
author: 林
location: 上海
noteNumber: NO. 026
---
Java 并发面试题：剩余并发基础章节未整理。
一、并发基础
1. 为什么要使用并发编程
一是提高多核 CPU 利用率，二是方便业务拆分并提升整体应用性能，比如电商下单过程中，减库存、生成订单等相互独立的操作可以由不同线程并行处理。
2. 并发编程有什么缺点
并发编程虽然通常是为了提高执行效率，但并不意味着线程越多就一定越快，它会额外带来上下文切换、线程安全、死锁以及内存泄漏等问题，反而可能降低 CPU 利用率和系统稳定性。内存泄漏是已经分配的内存无法被有效释放，持续积累后最终可能进一步导致内存溢出。
以 ThreadLocal 为例，ThreadLocalMap 中key 是对 ThreadLocal 对象的弱引用，而 value 是强引用。当其中的key所指向的ThreadLocal对象失去外部强引用后，就回被垃圾回收，但此时 value 仍被ThreadLocalMap强引用。在线程池中，如果线程长期存活，且未及时调用 remove()方法移除无用的键值对，无用的 value 就可能长期占用内存，从而造成内存泄漏。
3. 并发编程三个重要特性是什么？
并发编程最重要的三个特性是原子性、可见性和有序性。
原子性强调一组操作不可再分，要么全部成功、要么全部失败，中途不能被其他线程打断，可以通过 synchronized 或 Lock 等同步机制解决；	
可见性是指一个线程修改共享变量后，其他线程能够及时看到最新值，常通过 synchronized、volatile 等机制保证；
有序性是指程序执行结果应满足规定的先后关系，而编译器可能为了优化进行指令重排序，因此并发程序还需要相应机制约束重排序。需要依靠 JMM 的 Happens-Before 规则以及 volatile、锁等机制来约束。
4. 在 Java 程序中怎么保证多线程的运行安全？（同上）
5. 并行和并发的区别？
并行是多个处理器或多个 CPU 核心在同一时刻真正同时执行多个任务；
并发则强调在一段时间内处理多个任务，一个处理器可以通过时间片轮转在多个任务之间快速切换，从宏观上看像是同时推进，其实同一时刻只有一个任务在执行。
6. 什么是进程，什么是线程？
进程是对运行中程序及其资源的封装，是操作系统进行资源分配的基本单位；
线程则是进程内部的执行单元，是 CPU 调度的基本单位，用来实现进程内部的并发。
7. 什么是上下文切换？
上下文切换是 CPU 从一个线程切换到另一个线程执行时，对当前线程运行现场进行保存，并在之后重新调度该线程时恢复现场的过程。通常需要保存 CPU 寄存器、程序计数器以及栈指针等信息到线程控制块，切回时再恢复。上下文切换消耗 CPU 时间，因此线程过多、切换过于频繁会带来明显性能开销。
8. 守护线程和用户线程有什么区别呢？
用户线程是程序正常业务执行所依赖的前台线程，例如 main 线程；守护线程则是在后台为其他线程提供通用服务的线程，例如垃圾回收相关线程。只要 JVM 中仍有用户线程在运行，JVM 通常不会退出；当所有用户线程都结束后，即使守护线程仍未完成，JVM 也可以结束，守护线程会随 JVM 一起终止。
9. 什么是线程死锁？死锁四个必要条件？
死锁是两个或多个线程因为互相等待对方持有的资源而一直无法继续推进。
形成死锁通常需要同时满足四个条件：互斥条件、请求与保持条件、不可剥夺条件以及循环等待条件。
预防死锁就是设法破坏其中至少一个条件，例如一次性申请所需资源以破坏“请求与保持条件”；申请不到新资源时主动释放已有资源以破坏“不可剥夺条件”；或者规定所有线程必须按统一顺序申请资源，打破循环等待条件，但可能降低资源利用率；互斥条件对临界资源通常无法取消。
10. Java 线程有几种状态？
Java 的 Thread.State 一共定义了 6 种线程状态：
NEW 表示线程对象已经创建但还没有调用 start；
RUNNABLE 表示线程处于可运行状态；
BLOCKED 表示线程在进入 synchronized 同步区域时因获取不到监视器锁而阻塞；
WAITING 表示无限期等待，例如 主动调用对象的wait方法等待被唤醒notify；
TIMED_WAITING 表示带超时时间的等待，例如 Thread.sleep；
TERMINATED 表示 run 方法已经执行结束。
11. 线程状态如何流转？（同上）
12. Java 创建线程的方式？
Java 常见的线程创建或任务执行方式主要有四种：
第一，继承 Thread 并重写 run，创建子类对象后调用 start；
第二，实现 Runnable，把 Runnable 对象传入Thread类的构造方法得到一个Thread对象，再调用 start方法；
第三，实现 Callable，通过 FutureTask 包装后传入Thread类的构造方法得到一个Thread对象，再调用 start方法。Callable 的 call 方法可以返回结果，最终通过 FutureTask对象的get方法获取；
第四，如果需要统一管理大量并发任务，可以采用线程池。通过ThreadPoolExecutor创建一个ExecutorService类型的线程池，然后提交 Runnable 或 Callable，submit 后可以得到Future对象，任务完成后，调用 shutdown 释放线程池资源。
13. 说一下 Runnable 和 Callable 有什么区别？
Runnable 和 Callable 都可以描述需要异步执行的任务，区别在于：
● Runnable 的 run 方法没有返回值，方法不能向上抛出异常，异常通常只能在任务内部自行捕获；
● Callable 的 call 方法有返回值，并且允许向上抛出异常，可以通过调用Future/FutureTask对象的get方法获取任务执行结果和异常。

14. 什么是 Callable 和 Future？什么是 FutureTask？
Callable 用来定义“能够返回结果并可抛出异常”的异步任务，Future 表示这个异步任务未来可能得到的结果。FutureTask 是 Future 的一个具体实现，同时也实现了 Runnable，所以它既可以包装 Callable/Runnable 成为可执行任务，又能够保存任务的结果和异常，并支持 get 等待结果、判断完成状态以及取消任务等操作；如果任务尚未完成，get 会阻塞，cancel方法传入true 则会尝试中断正在运行的线程，传入false时如果这个任务还在任务队列中，后面不会执行，cancel方法不论传入什么，任务状态都会变成“已取消”。
15. sleep() 和 wait() 有什么区别？
sleep 和 wait 都能让当前线程暂停执行，但区别在于：sleep 是 Thread 的静态方法，主要用于让线程暂停一段时间，时间到后会自动恢复，而且 sleep 不会释放当前已经持有的锁；wait 是 Object 的实例方法，主要用于线程之间的条件等待和通信，调用 wait 时线程会释放该对象的监视器锁，并进入该对象的等待集合，通常要由其他线程在同一个对象上调用 notify/notifyAll 才能唤醒，或者在超时后自动返回。
16. 为什么线程通信的方法 wait()、notify() 和 notifyAll() 被定义在 Object 类里？
wait、notify 和 notifyAll 被放在 Object 类中，是因为 Java 的内置监视器锁是“对象级”的，线程等待的是某一个具体对象对应的锁。一个线程可能同时持有多个对象锁，如果把 wait/notify 设计成 Thread 的方法，虚拟机就很难明确到底要释放、等待或通知哪一把对象锁。
17. 为什么 wait()、notify() 和 notifyAll() 必须在同步方法或者同步块中被调用？
wait、notify、notifyAll 必须在 synchronized 方法或同步块中调用，核心原因是线程在调用它们之前必须持有同一个对象的监视器锁，从而把“检查条件”和“进入等待/发送通知”放在受互斥保护的临界区内，避免丢失唤醒。例如消费者刚判断队列为空、还没来得及 wait，生产者就先 notify，通知就可能白白丢失，消费者随后再 wait 便可能永久阻塞。
正确做法是在同一个 synchronized 锁内用 while 反复检查条件并调用 wait，wait 会释放锁并进入等待，被唤醒后重新竞争锁再继续判断。
18. 线程的 sleep() 方法和 yield() 方法有什么区别？
sleep 和 yield 都可能让当前线程暂时不继续占用 CPU，区别在于：
● sleep()方法让出CPU后给其他线程运行机会时不考虑线程的优先级，yield()方法只会给相同优先级或更高优先级的线程以运行的机会；
● sleep 让线程进入等待状态，在指定时间内暂停执行，而且不释放已经持有的锁，yield 让线程进入就绪状态。
● sleep方法会检测中断信号并可能抛出 InterruptedException，而 yield 不会，方法声明中没有抛出中断异常。
19. 如何停止一个正在运行的线程？
1. 设置一个volatile修饰的退出标志，工作线程不断检查该标志，其他线程修改后，工作线程主动跳出循环，结束run 方法；
2. 使用 interrupt 发出中断请求，线程在正常运行时主动检查中断标志并决定退出；
3. Thread.stop、suspend、resume 等强制杀死一个线程的方式已经废弃，不推荐使用，因为可能破坏共享数据的一致性。
20. Java 中 interrupted 和 isInterrupted 方法的区别？
interrupted() 是Thread类的静态方法，会检查目标线程的中断标志，并在返回后把中断标志清除；
isInterrupted() 是Thread类的实例方法，只读取目标线程的中断状态，不会清除中断标志。
21. 什么是阻塞式方法？
阻塞式方法是指在结果返回之前，调用线程会被阻塞，直到所等待的条件满足或方法结束。例如 FutureTask.get 会等待异步任务完成，sleep 会等待指定时间结束。
22. Java 中你怎样唤醒一个阻塞的线程？
对于由 wait 导致的阻塞，可以通过同一个锁对象上的 notify 或 notifyAll 进行唤醒。
23. notify() 和 notifyAll() 有什么区别？
调用对象的 wait 后，线程会进入这个对象的等待集合，不参与锁竞争。notify 只从等待线程中唤醒一个，具体选择哪个线程由虚拟机决定；notifyAll 会把所有等待线程都唤醒，使它们从等待集合转入锁竞争队列，然后重新竞争该对象的监视器锁。
24. Java 如何实现多线程之间的通讯和协作？
1. synchronized 配合 Object.wait/notify/notifyAll，通过对象监视器实现条件等待和通知；
2. 用 ReentrantLock 配合 Condition.await/signal/signalAll 支持更灵活的条件队列；
3. 还可以通过 PipedInputStream/PipedOutputStream 或字符管道在线程之间传输数据。

25. 同步方法和同步块，哪个是更好的选择？
通常同步块比整个同步方法更灵活，因为可以只把真正访问共享数据的临界代码放进 synchronized 块，而把耗时但不共享的本地计算留在锁外，从而缩短持锁时间、减小竞争范围。
总的原则就是同步范围越小越好、锁粒度越细越好，并尽量让不同共享资源使用不同锁，在保证线程安全的同时降低死锁和性能风险。
26. 什么是线程同步和线程互斥，有哪几种实现方式？
线程同步是指多个线程访问共享数据时，通过一定机制控制操作的先后关系；
线程互斥强调同一时刻最多只有一个线程使用某个共享资源。
实现方式包括 synchronized 隐式锁以及 ReentrantLock 等显式锁；
27. 在监视器（Monitor）内部，是如何做线程同步的？程序应该做哪种级别的同步？
当方法或代码块被 synchronized 修饰后，相应代码就进入该对象监视器的保护范围，同一时刻只有成功获得监视器的线程才能够执行这个方法或代码块。
总的原则就是同步范围越小越好、锁粒度越细越好，并尽量让不同共享资源使用不同锁，在保证线程安全的同时降低死锁和性能风险。
28. 如果你提交任务时，核心线程数已达到配置的数量，这时会发生什么？
提交任务时，如果当前运行线程数小于核心线程数，就新建核心线程直接执行；如果已经达到核心线程数，则优先把任务放入工作队列；如果队列已满且线程数仍小于最大线程数，再创建非核心线程执行；如果线程数已经达到最大线程数并且队列也满了，则触发拒绝策略。
29. 在 Java 程序中怎么保证多线程的运行安全？（同问题 4）
30. 你对线程优先级的理解是什么？
它只是对底层操作系统调度器的一个提示，而不是严格的执行顺序保证。高优先级线程不一定总能先于低优先级线程运行，因为真正调度还会考虑操作系统实现、线程是否处于可运行状态以及整体效率等因素。如果高优先级线程正在阻塞或休眠，它同样无法占用 CPU。
31. 线程类的构造方法、静态块是被哪个线程调用的？
线程类的静态代码块和构造方法由“创建这个线程对象的线程”执行。
32. Java 中怎么获取一份线程 dump 文件？你如何在 Java 中获取线程堆栈？
在 Linux 上可以先用 jps 找到 Java 进程 PID，再通过 jstack -l PID > xxx.txt 导出线程 dump。线程 dump 本质上记录了进程中各线程的调用栈、线程状态以及锁相关信息，常用于定位死锁、长时间阻塞、CPU 高占用等问题。
33. 一个线程运行时发生异常但没有被捕获会怎样？
如果一个线程运行过程中抛出了未捕获异常，该线程会终止执行，并且线程退出前，JVM 会查找该线程的 UncaughtExceptionHandler，并把线程对象和异常传给 handler 的 uncaughtException 方法进行处理。
public class GlobalExceptionHandler implements Thread.UncaughtExceptionHandler {

    @Override
    public void uncaughtException(Thread t, Throwable e) {
        // 关键：log.error 的最后一个参数传入 e，才会输出完整堆栈
        System.out.println("线程" + t.getName() + "发生未捕获异常" + e.toString());

        // 可选：告警上报、资源清理等兜底逻辑
    }
}
public class Test {
    public static void main(String[] args) {
        Thread t = new Thread(() -> {
            throw new RuntimeException("模拟异常");
        });
        t.setUncaughtExceptionHandler(new GlobalExceptionHandler());
        t.start();
    }

}
// 输出：线程Thread-0发生未捕获异常java.lang.RuntimeException: 模拟异常
34. Java 线程数过多会造成什么异常？
线程创建、销毁以及频繁的上下文切换，会消耗大量 CPU 和内存资源，可能增加 GC 压力，极端情况下导致内存耗尽甚至 OOM。
35. 多线程的常用方法？
● sleep 让当前线程在一段时间内进入超时等待，但不会释放已经持有的锁；
● join 用来等待另一个线程执行结束后再继续当前线程；
● wait 是对象级条件等待，调用时会释放对象监视器，并等待 notify/notifyAll 唤醒；notify/notifyAll 用来唤醒同一对象等待集合中的一个或全部线程。
● 此外还有 currentThread 获取当前线程、isAlive 判断是否存活、setName 设置线程名、setDaemon 设置守护线程、setPriority 设置优先级等辅助方法。
36. 介绍一下 ThreadLocal？
ThreadLocal 的核心思想是“同一个 ThreadLocal 对象，在不同线程中保存不同的值”，从而实现线程之间的数据隔离。每个 Thread 内部都有 threadLocals 字段，它是一个ThreadLocalMap，首次调用 ThreadLocal 的 get/set 时才会创建这个ThreadLocalMap；Map 的 key 是多个线程共享的ThreadLocal 对象，value 是当前线程自己的数据。
37. ThreadLocal 内存泄露问题了解吗？
ThreadLocal 内存泄漏的关键不是“key 使用弱引用”本身，而是线程会长期强引用自己的 ThreadLocalMap，而ThreadLocalMap中的 value 又是强引用。如果外部对 ThreadLocal 的强引用消失，GC 可以回收 ThreadLocal，使key 变成 null；后续 ThreadLocalMap 的 get/set/remove操作会清除key未null的键值对，使 value 有机会被回收。但在线程池中线程可能长期不结束，如果以后也不再触发这些清理操作，value 就可能一直被强引用。因此使用完 ThreadLocal 后应主动调用 remove，尤其是在复用线程的线程池场景中。
38. 为什么用 ThreadLocal 不用线程成员变量？
如果放进不同 Thread 类，又需要在 Runnable 中拿到当前线程并进行 instanceof 判断和强制转换，扩展新线程类型时还要不断增加分支，维护成本高。同一个 Runnable 可能被多个 Thread 执行，如果把数据放在 Runnable 中就会变成共享数据。
二、Java 并发理论：JMM / synchronized / volatile / CAS
39. 线程之间如何通信及线程之间如何同步？
线程通信解决的是“线程之间如何交换信息”，线程同步解决的是“多个线程的操作以什么相对顺序发生”。	
线程之间可以通过共享内存或消息传递通信，而 Java 主要采用共享内存模型，也就是 JMM：共享变量抽象地位于主内存，每个线程有自己的本地工作内存，线程 A 修改共享变量后需要把结果刷新到主内存，线程 B 再从主内存读取最新值。
正因为本地内存和重排序的存在，才会出现可见性、有序性等并发问题，所以 Java 通过 happens-before、volatile、synchronized、Lock 等机制建立线程之间明确的同步关系。
40. Happens-Before 原则
Happens-Before 是 JMM 用来描述“一个操作的结果必须对另一个操作可见，并建立先后约束”的核心规则。常见规则包括：同一线程中的程序次序规则；解锁 happens-before 后续对同一锁的加锁；对 volatile 变量的写 happens-before 后续读；happens-before 具有传递性；线程 start 之前的操作对启动后的子线程可见；子线程结束前的操作在 join 返回后对等待线程可见；interrupt 调用先行于被中断线程检测到中断；对象构造完成先于其终结逻辑。它并不要求所有指令绝对按源码顺序执行，而是在不破坏这些可见性和结果约束的前提下允许优化和重排序。

41. Java 怎么进行并发控制？
Java 并发控制大体可以分成悲观锁和乐观锁两中。
悲观锁以锁为核心，例如 synchronized 通过对象 Monitor 实现互斥，可以修饰实例方法、静态方法和代码块；AQS 通过一个volatile类型整数state 记录同步状态和一个FIFO 等待队列管理线程，实现了了一些共享式和独占式的同步器。例如 ReentrantLock是独占式的、Semaphore和CountDownLatch 共享式的。
乐观锁主要是 CAS+自旋，它假设冲突不频繁，更新时再比较预期值，符合预期再进行原子替换，Atomic 原子类就是典型应用。
42. synchronized 关键字
synchronized 是 Java 内置的互斥同步机制，用来解决多个线程竞争共享资源的问题。它既能保证临界区的原子性，也通过加锁和解锁建立内存可见性与有序性。早期 synchronized 作为重量级锁，它的实现依赖 Monitor 和操作系统 Mutex，线程阻塞/唤醒涉及用户态与内核态切换，开销较大；JDK 后续通过轻量级锁、自旋等方式降低锁竞争不激烈时的成本。synchronized 的锁对象可以是实例对象或 Class 对象，方法无论正常返回还是抛异常都会自动释放锁，并且它具有可重入性。
只有在锁竞争激烈、轻量级锁自旋失败后，锁才会“膨胀”为重量级锁，此时才会请求操作系统的 Mutex。一旦获取失败，线程会被挂起，并伴随用户态到内核态的切换，这正是重量级锁开销大的根本原因
43. 说说自己是怎么使用 synchronized 关键字？
使用 synchronized 时，可以按锁定对象选择三种典型方式：修饰实例方法时锁当前对象实例，适合同一对象内部共享状态的保护；修饰 static 方法时锁对应的 Class 对象，适合保护类级别共享资源（static成员变量）；修饰代码块时可以显式指定 this、Class 对象或专门的锁对象，从而把同步范围缩小到真正的临界代码。还要避免对字符串常量加synchronized 锁，防止不相关业务之间互相阻塞。
44. 说一下 synchronized 底层实现原理？
synchronized 的底层核心是对象关联的 Monitor。线程进入 synchronized 区域时会尝试获得 Monitor 所有权：如果进入计数为 0，则当前线程成为持有者并把计数设为 1；如果本线程已经持有，则允许重入并把计数加 1；如果 Monitor 已被其他线程占用，当前线程就进入阻塞等待，直到锁释放后再竞争。
45. synchronized 可重入的原理
synchronized 之所以支持可重入，是因为 Monitor 会记录当前持锁线程并维护一个进入计数器。同一个线程第一次获得锁后计数加 1，在还没有释放的情况下再次进入同一把锁保护的同步方法或代码块，不会被自己阻塞，而是继续把计数加 1；每退出一层同步区域计数减 1，只有计数最终减到 0 时，Monitor 才真正变成无持有者状态，其他线程才可以竞争这把锁。因此可重入能够支持一个同步方法在内部继续调用同一对象的其他同步方法。
46. 什么是自旋？
自旋的思想是：当线程暂时拿不到锁时，不立刻进入阻塞，而是在用户态短时间循环检查锁是否已经释放。这样做适合临界区非常短、预计锁很快就能释放的场景，因为一次线程阻塞和唤醒往往需要用户态与内核态切换，成本高；如果自旋若干次仍然失败，再真正挂起线程。代价是自旋期间线程会持续占用 CPU，因此竞争激烈或持锁时间长时并不划算。
47. 多线程中 synchronized 锁升级是什么？
偏向锁：是JVM对synchronized的优化，如果只有一个线程访问同步资源，一旦线程获取锁，后续无需重复加锁。
轻量级锁：当偏向锁被多个线程竞争时升级为轻量级锁，其他线程会通过自旋尝试获取锁，不会阻塞。
重量级锁：轻量级锁自旋失败一定次数后升级为重量级锁，线程进入阻塞。重量级锁依赖操作系统的互斥量实现，重量级锁会使其他申请的线程进入阻塞，性能降低。
48. 线程 B 怎么知道线程 A 修改了变量？
1. 可以使用 volatile，写一个volatile变量后立刻刷新到主内存中，其他读线程就可以读取到最新值；
2. 也可以使用 synchronized 或 Lock，因为根据happens-before规则，对同一把锁的解锁 happens-before 后续加锁，释放锁时刷新变量最新状态到主内存中、重新加锁时读取最新状态。
synchronized可见性的实现：monitorenter/monitorexit字节码指令内置内存屏障逻辑，解锁 
（monitorexit）时，强制刷新本地缓存到主存，加锁（monitorenter）时，强制清空本地缓存，从主存
重新加载。
49. 当一个线程进入一个对象的 synchronized 方法 A 之后，其它线程是否可进入此对象的 synchronized 方法 B？
如果线程 A 已经进入某个对象的非静态 synchronized 方法 A，那么其他线程不能同时进入同一个对象的另一个非静态 synchronized 方法 B，因为二者竞争的是同一把对象 Monitor。
50. synchronized、volatile、CAS 比较
synchronized、volatile 和 CAS 解决并发问题的方式不同。
synchronized 是悲观锁，认为共享资源可能发生冲突，因此先加锁，未获得锁的线程可能阻塞；
volatile 不提供互斥，主要保证共享变量的可见性并禁止特定的指令重排序，适合状态标记等场景
CAS 属于乐观的非阻塞更新，通过比较“当前值是否仍等于预期值”来决定是否原子写入新值，失败后通常自旋重试。
51. synchronized 和 Lock 有什么区别？
52. synchronized 和 Lock 如何选择？
53. synchronized 和 ReentrantLock 区别是什么？
● 原理上： synchronized 是Java内置关键字，底层基于Monitor，ReentrantLock底层基于AQS。
● 用法上：synchronized 可以给类、方法、代码块加锁；而 ReentrantLock 只能给代码块加锁。
● 锁类型上：synchronized 是非公平锁，而 ReentrantLock 默认为非公平锁，也可以手动指定为公平锁。
● 锁的释放上：synchronized 不需要手动获取锁和释放锁，它是由JVM自动管理的，发生异常会自动释放锁，不容易造成死锁；而 lock 需要自己加锁和释放锁，如果使用不当没有及时释放锁就可能造成死锁。
● 锁的灵活性上：synchronized 锁不够灵活，一旦 synchronized 锁已经被某个线程获得了，此时其他线程如果还想获得，那它只能被阻塞。Lock 类在等锁的过程中，无法获取锁可以立即返回、中断退出或者等待一段时间后退出，实现上更加灵活。
● 性能区别：在 Java 5 以及之前，synchronized 的性能比较低，但是到了 Java 6 以后，发生了变化，因为 JDK 对 synchronized 进行了很多优化，比如自适应自旋、锁消除、锁粗化、轻量级锁、偏向锁等，所以后期的 Java 版本里的 synchronized 的性能并不比 ReentrantLock 差。
synchronized是非公平锁，锁释放瞬间，正在CPU运行的新线程拥有插队抢锁的资格，比已经阻塞排队的线程(在EntryList中)优先竞争，因为这样可以避免上下文切换带来的开销。如果有源源不断的新进程到来，就可能使得很早就进入EntryList的线程发生饥饿。
【锁消除 Lock Elision】
JIT 通过逃逸分析发现某个锁对象只被当前线程使用，不会逃逸出去，就干脆把 synchronized 消除掉。
【锁粗化 Lock Coarsening】
如果 JIT 发现对同一个对象连续多次加锁、解锁，可能会把它们合并成一次更大范围的锁，减少反复加锁解锁的开销。
比如循环里反复：
for (int i = 0; i < n; i++) {
    synchronized (lock) {
        list.add(i);
    }
}
JIT 可能优化成：
synchronized (lock) {
    for (int i = 0; i < n; i++) {
        list.add(i);
    }
}
当然，前提是语义等价。
54. volatile 关键字的作用
volatile 主要提供两项能力：保证可见性和禁止特定的指令重排序。
可见性的实现原理：在volatile变量之后加上写屏障，保证在这个写屏障之前的所有对共享变量的
修改都同步到主存中，在读volatile变量之前加上读屏障，保证在这个读屏障之后的所有对共享变量的读取都从主存中读取。因此保证了可见性。 
禁止指令重排序原理：在写volatile变量之后加上写屏障，使得写屏障之前的代码不会被调整到写屏障（volatile写操作）之后，在读volatile之前加上读屏障，使得读屏障之后的代码不会被调整到读屏障(volatile读操作)之前。【所以在new一个对象的时候分为三步：1.分配内存；2.初始化；3.赋值引用，这个引用如果是volatile修饰的，前面第二步的初始化操作就不会被放到第三步之后，因此可以避免一个线程还没执行第三步的初始化，其他线程就拿到了每初始化的对象去使用】
但 volatile 不能把 i++ 这类“读—改—写”复合操作变成原子操作，因此 AtomicInteger 等原子类会把 volatile 的可见性与 CAS 更新结合起来；CAS 还可能存在 ABA 问题，可用带版本戳的 AtomicStampedReference 处理。
55. Java 中能创建 volatile 数组吗？
能，Java 中可以创建 volatile 类型数组，不过只是一个指向数组的引用，如果改变引用指向的数组，将会受到 volatile 的保护，但是如果多个线程同时改变数组的元素，volatile 就不能保证对这个元素的可见性。
56. volatile 变量和 atomic 变量有什么不同？
volatile 变量可以确保可见性但并不能保证原子性。例如 count++ 实际包含读取、加一、写回三个步骤，即使 count 是 volatile，多线程也可能丢失更新。
AtomicInteger 等 Atomic 类则把 volatile 与 CAS 结合，适合单变量高并发原子更新。
57. volatile修饰后，long/double 的读取、写入操作整体可拆分吗？
不可以。使用volatile修饰后，JVM 强制 64 位 long/double 的读取、写入操作整体不可拆分，不会拆成两次 32 位读写）。
58. synchronized 和 volatile 的区别是什么？
● volatile 是变量修饰符；synchronized 可以修饰方法，代码块。 
● volatile 仅能保证多线程安全中的可见性和有序性，不能保证原子性；而 synchronized 则可
以保证可见性、有序性和原子性。
● volatile 不会造成线程的阻塞；synchronized 可能会造成线程的阻塞。
59. Lock 接口和 synchronized 对比同步它有什么优势？（参考51）
60. 乐观锁和悲观锁的理解及如何实现，有哪些实现方式？
● 悲观锁：总是假设最坏的情况，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会阻塞直到它拿到锁。比如 Java的 synchronized 关键字的实现就是悲观锁。 
● 乐观锁：就是乐观的任务每次去拿数据的时候都认为别人不会修改，所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据，可以使用版本号等机制。乐观锁适用于读操作比较多的场景。在 Java中原子变量类就是使用了乐观锁的一种实现方式 CAS 实现的。CAS时如果发现和期待的值不同，一般会自旋一定次数（默认是10）。
61. 什么是 CAS？
CAS 是 Compare And Swap，也就是“比较并交换”，是一种由硬件支持的原子更新方式。它通常包含三个值：内存中的当前值 V、预期旧值 expect 和希望写入的新值 update；执行时先比较当前值是否仍等于预期值，相等则把新值原子写入，不相等则说明期间有其他线程修改过数据，本次更新失败。更新失败的线程通常不会立刻阻塞，而是重新读取最新值并继续自旋尝试。
62. CAS 会产生什么问题？
CAS 的典型问题有三个。
第一是存在ABA问题。也就是一个值从 A 被其他线程改成 B 又改回 A，CAS 只比较当前值会误以为“没有变化”，可以用 AtomicStampedReference 增加版本号同时比较“值+版本号”解决；
第二是长时间自旋开销。当竞争激烈时大量 CAS 失败会持续占用 CPU，可能还不如阻塞锁；
第三是只能保证一个共享变量的原子操作。当对一个共享变量执行操作时，我们可以使用循环 CAS 的方式来保证原子操作，但是对多个共享变量操作时，循环 CAS 就无法保证操作的原子性，这个时候就可以用锁，把对多个共享变量的操作放在一个同步代码中。
63. 什么是原子类？
原子类是在不需要加锁的情况下，为单个变量提供线程安全的更新操作。它是通过volatile和CAS实现的。
64. 原子类的常用类
常用原子类包括 AtomicBoolean、AtomicInteger、AtomicLong 和 AtomicReference。前三者分别用于 boolean、int、long 类型的原子读写与更新，AtomicReference 则可以对对象引用做原子比较和替换。
65. 说一下 Atomic 的原理？（类63）
66. 死锁与活锁的区别，死锁与饥饿的区别？
死锁、活锁和饥饿都表示线程长期无法正常推进，但具体表现不同：
● 死锁是线程互相等待对方持有的资源，所有相关线程都停住，通常不会自行恢复；
● 活锁中线程并没有阻塞，而是在不断“尝试—失败—释放—再尝试”，状态一直变化却始终做不成事情，例如两个线程反复互相礼让资源，可通过随机退让、统一锁的获取顺序等方式打破。
● 饥饿则是某个线程长期拿不到所需资源，例如非公平锁下新线程持续插队、低优先级线程长期得不到 CPU。

三、线程池
67. 什么是线程池？为什么要用线程池？
线程池就是提前创建并统一管理一组工作线程，用它们反复执行提交的任务，而不是每来一个任务就新建一个线程。它的主要价值有三点：
● 复用线程，减少频繁创建和销毁带来的资源消耗；
● 任务到达后可以直接由现有线程处理，提高响应速度；
● 控制线程数量、队列、拒绝策略、监控和调优，避免无限制创建线程导致 CPU、内存耗尽。

68. 线程池核心参数有哪些？
● ThreadPoolExecutor 的核心构造参数通常有 7 个：核心线程数、最大线程数、非核心线程空闲存活时间、时间单位、工作队列用来缓存等待执行的任务、线程工厂负责创建线程还有队列和线程数都达到上限后的拒绝策略。
● 最大线程数减去核心线程数就是非核心线程数，在有界队列满且核心线程都忙时才会继续创建这些线程，空闲超过 keepAliveTime 后通常会被回收。
《阿里巴巴 Java 开发手册》明确禁止使用 Executors 创建线程池，因为队列/线程数无界容易导致 OutOfMemoryError。建议自己 new ThreadPoolExecutor，明确队列容量和拒绝策略。
69. 线程池的种类、区别和使用场景
1. newCachedThreadPool 核心线程为 0、最大线程数为整型最大值，只有非核心线程，队列中不存放任务，适合任务执行很快的场景，任务过慢可能造成线程数失控；
2. newFixedThreadPool 核心数等于最大数为n，配合无界队列，适合任务执行较长的场景，但队列可能无限堆积；
3. newSingleThreadExecutor 核心数等于最大数为1，始终由单个工作线程按顺序执行任务，即使工作线程异常退出也会创建替代线程，适合必须串行执行的任务；
4. newScheduledThreadPool 使用延迟队列，适合定时和周期任务。
没有无参的 newFixedThreadPool()，必须传入线程数。

70. 线程池的拒绝策略有哪些？
● AbortPolicy 是默认策略，直接抛出拒绝执行异常；
● DiscardPolicy 是丢弃新任务；
● DiscardOldestPolicy 丢弃队列中等待最久的队头任务，再尝试提交新任务；
● CallerRunsPolicy 让提交任务的线程自己执行任务。
71.  Java 中 Executor 和 Executors 的区别？
Executor是接口，只定义 execute(Runnable)方法，用来抽象“任务如何被执行”；
Executors 是一个工具类，提供一系列静态工厂方法用于快速创建不同类型的 ExecutorService（ newFixedThreadPool、newCachedThreadPool ）。
ExecutorService 接口继承了 Executor 接口并进行了扩展，提供了更多的方法，可以获得任务执行的状态并且可以获取任务的返回值。例如新增submit等方法，可以传入Callable对象，返回Future对象，外部可以通过Future.get()获取结果。
不推荐直接用 Executors 创建线程池，因为无界队列或无限线程可能导致 OOM，更推荐手动 new ThreadPoolExecutor 并设置有界队列和拒绝策略。

72. 线程池都有哪些状态？
线程池常见有五种状态：
● RUNNING，正常接收新任务并处理队列任务；
● SHUTDOWN，不再接收新任务，但会继续把队列里已有任务执行完；
● STOP，不接收新任务，也不再处理队列，并尝试中断正在运行的线程；
● TIDYING，所有任务结束、工作线程数降为 0，线程池准备执行钩子方法 terminated()；
● TERMINATED，terminated 执行完成，线程池彻底终止。
shutdown 和 shutdownNow 的行为差异，本质上就是驱动线程池进入不同的关闭状态和任务处理策略。
线程池真正关闭（进入 TERMINATED）前，会回调一次terminated() 方法，它本身是空的，是留给子类扩展用的，方便做自定义的清理或通知工作，通过继承 ThreadPoolExecutor 并重写来使用。
73. 线程池中 submit() 和 execute() 方法有什么区别？
● execute 和 submit 都能把任务交给线程池执行，但有一些不同。
● execute 只接收 Runnable，没有返回值；submit 可以接收 Runnable 或 Callable，并返回 Future，因此可以获取结果、取消任务或感知异常。
● 异常处理也不同：通过 execute 执行的任务如果抛出未捕获异常，通常会直接打印异常并导致该工作线程结束，线程池随后补建线程；submit 会把异常封装进 Future，工作线程通常仍可复用，只有调用 future.get() 时异常才会以 ExecutionException 的形式抛给调用者。
【取消任务】
Future<?> f1 = pool.submit(task);  // 任务排在队列里
f1.cancel(false);                  // 成功,任务不会被执行,只对还没开始的任务有效

Future<?> f2 = pool.submit(() -> {
    while (!Thread.currentThread().isInterrupted()) {  // 响应中断
        // do work
    }
});
f2.cancel(true);  // 能中断
74. 分析线程池的实现原理和线程的调度过程（同28）
75. 线程池的最大线程数目根据什么确定？
最大线程数需要根据任务类型和硬件资源确定，而不是越大越好。
● CPU 密集型任务主要消耗计算资源，线程数通常接近 CPU 核心数，例如核心数+1，过多只会增加上下文切换；
● IO 密集型任务大量时间在等待网络、磁盘或数据库返回，CPU 空闲较多，可以配置更多线程，例如2×CPU 核数。
具体生产环境下还要结合任务耗时、吞吐要求、连接池容量，进行压测与监控后调整。
76. 线程池如何调优？
● 线程池参数的配置上，比如最大线程数的配置，要看任务类型。CPU 密集型任务线程数应较少，通常约 CPU 核数+1；IO 密集型由于存在大量CPU空闲时间，可以配置更多线程，可以按照“核心数×(1+等待时间/计算时间)”估算
● 对于混合型任务，如果可以拆分，则将其拆分成一个 CPU 密集型任务和一个 IO 密集型任务。只要这两个任务执行的时间相差不是太大，那么分解后并发执行的吞吐率要高于串行执行的吞吐率。
● 队列尽量使用有界队列，便于形成容量上限、监控和拒绝预警，避免任务无限堆积导致 OOM。
CPU 密集型任务最大线程数采用CPU 核数+1，多一个是为了处理偶然出现的缺页中断等情况带来的阻塞，还有线程可以顶上去，保证CPU核心都被使用
77. 线程池如何实现动态修改？
线程池可以通过 ThreadPoolExecutor 提供的 setter 方法动态调整核心线程数、最大线程数、空闲线程存活时间以及拒绝策略等参数。工程上可以把这些参数放入 Nacos 等配置中心，监听配置变化后调用这些方法实时更新，具体还需要配合监控和告警，例如观察线程池活跃度（activeCount/maximumPoolSize）判断线程池负载情况，还有队列等待任务的数量以及触发拒绝异常的次数，通过设置相应的阈值，及时告警。
78. 使用无界队列的线程池会导致什么问题？
无界队列最大的风险是任务可以持续堆积而没有明确上限。以 newFixedThreadPool 默认使用的 LinkedBlockingQueue 为例，如果任务提交速度长期高于线程池处理速度，或者单个任务执行很慢，后续任务会不断进入队列，导致内存使用持续上涨，严重时发生 OOM。因此生产环境通常更倾向有界队列并配合拒绝、限流和监控。
79. 如果线程池当前处于空闲状态，那几个核心线程处于什么状态？为什么？
线程池空闲时，核心线程默认不会销毁，而是长期等待新的任务到来，因此通常处于等待类状态，而不是 RUNNABLE 或 TERMINATED，在线程池内部它们通常阻塞在工作队列的 take 操作上。
线程池里空闲的工作线程，核心线程阻塞在 workQueue.take() 上无限等待任务，非核心线程阻塞在 workQueue.poll(keepAliveTime) 上限时等待、超时即回收；任务提交时通过队列的 offer() 唤醒它们——这就是线程池“线程复用”和“按需扩缩容”的底层机制。
● poll(long timeout, TimeUnit unit)：在指定的时间内尝试移除并返回队列的头部元素，如果成功则返回元素；如果超时仍未成功，则返回 null。
● take()：如果队列不为空，则移除并返回队列的头部元素；如果队列为空，则线程会被阻塞，直到队列中有元素。
四、Lock / AQS / ReentrantLock
80. Lock 接口和 synchronized 同步对比它有什么优势？（同 51）

81. 怎么理解 Lock 与 AQS 的关系？
● Lock是面向锁的使用者的，他定义了使用者与锁的交互接口，隐藏了实现细节。
● 而AQS是面向锁的实现者的，它简化了锁的实现方式，屏蔽了同步状态的管理，线程的排队，等待与唤醒等底层操作。
82. 什么是 AQS？
AQS 是抽象队列同步器，它是很多锁和同步工具的底层同步框架。它通过一个volatile修饰的整型变量state 表示资源占用情况，并管理竞争失败线程的等待队列。它支持独占和共享两种同步模式：独占模式同一时刻通常只有一个线程成功获得锁资源，例如 ReentrantLock；共享模式同一时刻允许多个线程同时获得锁资源，例如 Semaphore、CountDownLatch。
AQS是抽象类，但里面没有一个抽象方法。
83. AQS如何实现ReentrantLock、Semaphore、CountDownLatch的？
● AQS 实现 ReentrantLock 时， state表示锁的持有状态，ReentrantLock 内部有公平和非公平两个同步器子类继承 AQS，加锁时通过 CAS 把 state 从 0 改成 1 表示获取成功，重入时再对 state 递增，解锁时递减，减到 0 才真正释放；获取失败的线程会被封装成节点加入 AQS 等待队列并阻塞，释放锁时唤醒后继节点，公平锁还会先检查队列里有没有前驱节点，如果有就直接获取失败、不抢锁。非公平锁不检查前驱节点，只要 state为0 就直接通过 CAS 抢锁。
● AQS 实现 Semaphore 时，state表示剩余许可数量，支持多个线程同时持有许可，是一种共享式的同步器。线程通过 CAS 把 state 减 1，state大于等于0就表示成功拿到许可，小于 0 就说明许可耗尽，线程进入 AQS 等待队列阻塞；线程归还许可时，通过CAS 让state 加 1 并唤醒等待队列中的线程。
● AQS 实现 CountDownLatch 时，state表示“还未完成的计数”，调用 await() 的线程会检查 state 是否为 0，不为 0 就进入 AQS 等待队列阻塞；其他线程每调用一次 countDown() 就用 CAS 把 state 减 1，当 state 减到 0 时说明所有等待条件满足，于是唤醒等待队列里的全部线程（唤醒那个阻塞在await上的线程），它是一种一次性的共享式同步器，计数归零后无法重置，这也是它与 CyclicBarrier 的关键区别。


84. AQS 有哪些核心的方法？
一共三类方法 
第一类：3个访问和修改同步状态的方法（getState/setState/CAS）。 
第二类：5个可重写方法（tryAcquire、tryRelease、tryAcquireShared、tryReleaseShared、 
isHeldExclusively）定义同步逻辑（是公平锁还是非公平锁就看我们怎么实现tryAcquire了）。
第三类：9个模版方法（acquire、release、acquireShared、releaseShared等）完成线程排
队、阻塞和唤醒流程。
85. ReentrantLock 和 synchronized 的对比？（同51）

86. 什么是可重入，什么是可重入锁？
可重入是指同一个线程已经持有一把锁时，在锁尚未释放之前仍可以再次获取这把锁，而不会被自己阻塞。
87. 公平锁和非公平锁有什么区别？
公平锁强调按等待先后顺序分配锁：锁释放后，已经在等待队列中排得更靠前的线程优先获得，新来的线程即使已经在CPU上运行了也不能插队，要让出CPU执行权，这会带来更多线程上下文切换的开销。而非公平锁中，新线程到达时不用查看等待队列中是否有线程在排队，可以直接竞争锁，如果此时恰好锁空闲，就可以直接获得锁，不需要入队，因此减小了上下文切换的开销，但可能让等待时间较长的线程一直被插队，极端情况下产生饥饿。
88. 为什么非公平锁比公平锁性能更好？（同上）
89. ReentrantLock 是如何实现公平锁的？非公平锁的？
ReentrantLock 中公平锁和非公平锁的实现中，主要不同在公平锁在tryAcquire方法的判断条件多了hasQueuedPredecessors()方法，即加入了同步队列中当前节点是否有前驱节点的判断，如果该方法返回true，则表示有线程比当前线程更早地请求获取锁，因此需要等待前驱线程获取并释放锁之后才能继续获取锁。
ReentrantLock类内部总共存在Sync、NonfairSync、FairSync三个类，NonfairSync与FairSync类继承自Sync类，Sync类继承自AbstractQueuedSynchronizer抽象类。

90. ReentrantReadWriteLock 是什么？
ReentrantReadWriteLock 是 ReadWriteLock 的可重入实现，它提供了读锁和写锁。读锁和读锁之间不互斥，读锁和写锁、写锁和写锁之间互斥。
91. 共享锁和独占锁有什么区别？
共享锁允许多个线程同时获得同一同步资源，典型例子是读锁，多个读线程可以并发进入；独占锁则同一时刻只能由一个线程持有，其他线程必须等待，典型例子是写锁。
92. 线程持有读锁还能获取写锁吗？
写锁可降级为读锁：同一线程持有写锁时，可以再获取读锁，然后释放写锁，变成只持读锁。
读锁不能升级为写锁：持有读锁时再申请写锁会死锁（自己等自己释放读锁）。
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadToWriteDeadlock {

    private static final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private static final ReentrantReadWriteLock.ReadLock  readLock  = rwLock.readLock();
    private static final ReentrantReadWriteLock.WriteLock writeLock = rwLock.writeLock();

    public static void main(String[] args) {
        // 先获取读锁
        readLock.lock();
        System.out.println("已获取读锁");

        // 再尝试获取写锁 —— 死锁！
        System.out.println("尝试获取写锁...");
        writeLock.lock();   // ⚠️ 永远阻塞在这里
        System.out.println("已获取写锁（不会执行到）");

        // 释放锁
        writeLock.unlock();
        readLock.unlock();
    }
}
93. 什么是锁的升降级？ReentrantReadWriteLock 为什么不支持锁升级？
ReentrantReadWriteLock 支持写锁降级为读锁，但不支持读锁升级为写锁，核心原因是升级容易导致死锁：例如两个线程都持有读锁，又都想升级为独占写锁，每个线程都必须等“其他读锁”释放，但双方都在等写锁而不会先释放自己的读锁，于是形成相互等待。
94. ReentrantReadWriteLock 底层读写状态如何设计的？
ReentrantReadWriteLock 在一个 AQS 的state 中同时编码读锁和写锁状态，把 32 位 state 拆成两部分：高 16 位表示读锁的持有次数（所有读线程持有读锁的总数），低 16 位表示写锁的重入次数（同一写线程的重入计数）；读锁获取时用 CAS 将高 16 位加 1，写锁获取时用 CAS 将整个状态加 1
五、并发安全容器与并发工具类
95. ConcurrentHashMap 和 Hashtable 的区别？
ConcurrentHashMap 和 Hashtable 都是线程安全 Map，但并发实现方式差异很大。Hashtable 基本依赖同一把 synchronized 锁保护主要操作，一个线程进行 put 时其他 get/put 也可能被阻塞，并发度较低；ConcurrentHashMap 在 JDK 1.7 采用分段锁，把数据拆成多个段，不同段可并发访问，JDK 1.8 则取消分段锁，使用 Node 数组+链表/红黑树，并通过 CAS+synchronized 做桶级别并发控制，锁粒度更细。
96. ConcurrentHashMap JDK 1.7 实现的原理是什么？
JDK 1.7 的 ConcurrentHashMap 采用“段数组 + 数组/链表”的分段锁结构。整个 Map 被划分成多个 段，每个 段继承 ReentrantLock，本身就是一把独立的可重入锁；段内部维护哈希数组，每个桶中再通过链表解决哈希冲突。修改某个段中的数据时只需要获得该段的锁，因此同一段内的并发写会互斥，但不同 Segment 之间可以同时写。
97. ConcurrentHashMap JDK 1.8 实现的原理是什么？
JDK 1.8 的 ConcurrentHashMap 取消了 JDK 1.7 的分段锁，整体结构改成与 HashMap 1.8 类似的 Node 数组+链表/红黑树，并使用 CAS 与 synchronized 共同保证线程安全。锁粒度下降到桶级别，对Node 链表的头节点或者红黑树的根节点加锁，只要线程访问的桶不同，就能并行操作。链表达到一定长度且数组容量满足一定条件时会树化为红黑树，从而避免单个桶链表过长导致查询性能下降。
98. ConcurrentHashMap JDK 1.7 的实现和 1.8 的实现有什么区别？
● 线程安全实现上，1.7 使用分段的方式，对每个段加锁，1.8中锁粒度进一步细化到桶，并发能力更强；
● 哈希冲突的解决上，1.7 主要是数组+链表，1.8 在链表过长时可转换为红黑树。
99. JDK 1.8 中，ConcurrentHashMap 什么情况下链表才会转换成红黑树进行存储？
链表长度大于8，且数组长度大于等于64。
100. JDK 1.8 中，ConcurrentHashMap 的 put 过程是怎样的？
JDK 1.8 中 ConcurrentHashMap 的 put 流程整体和 HashMap 类似，但会加入并发控制：如果桶数组尚未初始化，先完成初始化；目标桶为空时，优先通过 CAS 把新节点直接放到桶首；如果发现正在扩容，当前线程可以参与迁移；如果桶不为空且没有处于迁移状态，则对该桶加锁，在链表或红黑树中查找 key，存在就覆盖旧值，不存在就插入新节点。插入新元素后会更新元素计数，并根据容量与阈值判断是否需要扩容或进行树化处理。
101. ConcurrentHashMap 的 get 方法是否要加锁，为什么？
ConcurrentHashMap中，对get方法中用到的共享变量都使用volatil关键字修饰，而且没有修改共享数据，所以整个get方法不加锁也不会有问题。这也避免了读操作之间互相阻塞，获得较高并发读性能。
102. ConcurrentHashMap 默认初始容量是多少？
ConcurrentHashMap 的默认初始容量是 16。
103. ConcurrentHashMap 的 key、value 是否可以为 null？
● ConcurrentHashMap 的 key 和 value 都不能为 null，传入 null 会抛出空指针异常。value 不允许为 null 的原因：并发环境下 get 返回 null 时必须能明确表示“没有这个 key”，如果允许 value 本身也为 null，就会产生二义性。虽然有containsKey方法可以进一步判断是否存在键值对也没有用，因为containsKey是不会加锁的，如果一个线程还没有判断完，另一个线程就put这个key进去了，那也存在二义性，containsKey方法返回的结果不知道是线程put之后执行的结果还是没有put之前执行的结果。
● HashMap在单线程下key 和 value 都允许为 null，key 为 null 时，hash 值固定为 0，存放在数组下标 0 的位置，因此只能有一个 null key。value 为 null 可以有多个。
104. 存储在 ConcurrentHashMap 中每个节点是什么样的，有哪些变量？
JDK 1.8 的 ConcurrentHashMap 底层节点是 Node<K,V>。核心字段包括 hash、key、value 和 next。 value 和 next 使用 volatile 修饰，以保证并发线程之间读取这些关键字段时的可见性。如果桶内链表转为红黑树，节点类型会从 Node 换成 TreeNode<K,V>：它继承自 Node，因此同样具备 hash、key、val、next 四个变量，但额外增加了红黑树所需的指针和字段：指向父节点、左子节点、右子节点的指针还有颜色标记。
105. 什么是 BlockingQueue？
BlockingQueue 是在普通队列基础上增加“阻塞插入”和“阻塞获取”能力的线程安全队列。
106. 你了解的阻塞队列有哪些？
常见 BlockingQueue 实现包括：
● ArrayBlockingQueue，基于数组的有界队列；
● LinkedBlockingQueue，基于链表，默认容量很大，也可以显式设置为有界；
● PriorityBlockingQueue，按优先级排序的无界阻塞队列；
● DelayQueue，只有延迟到期的元素才能被取出，常用于延时任务；
● SynchronousQueue，本身不保存元素，每次 put 必须与一次 take 直接配对；
● LinkedTransferQueue，支持生产者通过 transfer 直接把元素交给消费者；
● LinkedBlockingDeque，支持两端插入和移除的双向阻塞队列。
选择时主要看是否有界、是否需要优先级、延迟、直接交接或双端操作。
107. ArrayBlockingQueue 和 LinkedBlockingQueue 有什么区别？
ArrayBlockingQueue 和 LinkedBlockingQueue 都是线程安全阻塞队列，但实现特点不同：
● 前者基于数组，创建时必须指定容量，是严格有界队列；后者基于链表，默认容量是 Integer.MAX_VALUE，也可以显式设置上限。
● 锁设计上，ArrayBlockingQueue 的生产和消费共用一把锁，而 LinkedBlockingQueue 将生产 putLock 和消费 takeLock 分离，所以生产和消费可以一定程度并发，但多个生产者之间仍竞争 putLock、多个消费者之间仍竞争 takeLock。
● 内存上，数组队列会预先分配固定空间，链表队列则随元素增加动态创建节点。
108. 如果队列是空的，消费者会一直等待，当生产者添加元素时，消费者是如何知道当前队列有元素的呢？
阻塞队列内部通过“条件等待+通知”模式让生产者和消费者感知状态变化。消费者在空队列上取元素时会进入等待；生产者成功放入元素后，会通知等待“非空条件”的消费者重新竞争并取数据。反过来，队列满时生产者会等待“非满条件”，消费者取走元素后再通知生产者队列有可用空间。这是通过 Lock + Condition 实现这种 await/signal 机制，把等待和唤醒逻辑封装在队列内部。
109. CountDownLatch、CyclicBarrier、Semaphore、Exchanger 了解吗？
CountDownLatch、CyclicBarrier、Semaphore、Exchanger 都是并发协作工具，但用途不同。
● CountDownLatch 面向任务完成数量，用一个递减计数器让一个或多个线程等待若干任务完成，任务完成后调用 countDown，等待线程通过 await 阻塞直到计数归零，也可设置超时。计数器不可以重置；
● CyclicBarrier面向参与线程数量，让一组线程在屏障点集合，最后一个线程到达后统一放行，计数器可重置；
● Semaphore 用许可数量限制同时访问某个资源的线程数；
● Exchanger 让两个线程在 exchange 同步点互换数据，一方到达会等待另一方，也可以设置最大等待时间。
110. CyclicBarrier 和 CountDownLatch 有什么区别？（同上）
