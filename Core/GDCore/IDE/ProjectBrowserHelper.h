/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

namespace gd {
class Project;
class String;
class EventsFunctionsExtension;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
class ArbitraryEventsWorker;
class ArbitraryEventsWorkerWithContext;
class ArbitraryEventsFunctionsWorker;
class ArbitraryObjectsWorker;
class ArbitraryEventBasedBehaviorsWorker;
class ArbitraryBehaviorSharedDataWorker;
} // namespace gd

namespace gd {

/**
 * \brief Expose a subset of the project to workers.
 */
class GD_CORE_API ProjectBrowserHelper {
public:
  /**
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project &project,
                                  gd::ArbitraryEventsWorker &worker);

  /**
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project &project,
                                  gd::ArbitraryEventsWorkerWithContext &worker);

  /**
   * \brief Call the specified worker on all events of the project (layout and
   * external events) but not events from extensions.
   *
   * Only use this for stats.
   */
  static void
  ExposeProjectEventsWithoutExtensions(gd::Project &project,
                                       gd::ArbitraryEventsWorker &worker);

  /**
   * \brief Call the specified worker on all events of the event-based
   * behavior
   *
   * This should be the preferred way to traverse all the events of an events
   * based behavior.
   */
  static void ExposeEventsBasedBehaviorEvents(
      gd::Project &project, const gd::EventsBasedBehavior &eventsBasedBehavior,
      gd::ArbitraryEventsWorker &worker);

  /**
   * \brief Call the specified worker on all events of the event-based
   * behavior.
   *
   * This should be the preferred way to traverse all the events of an
   * event-based behavior.
   */
  static void ExposeEventsBasedBehaviorEvents(
      gd::Project &project, const gd::EventsBasedBehavior &eventsBasedBehavior,
      gd::ArbitraryEventsWorkerWithContext &worker);

  /**
   * \brief Call the specified worker on all events of the event-based
   * behavior.
   *
   * This should be the preferred way to traverse all the events of an
   * event-based behavior.
   */
  static void
  ExposeEventsBasedObjectEvents(gd::Project &project,
                                const gd::EventsBasedObject &eventsBasedObject,
                                gd::ArbitraryEventsWorkerWithContext &worker);

  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  static void ExposeProjectObjects(gd::Project &project,
                                   gd::ArbitraryObjectsWorker &worker);

  /**
   * \brief Call the specified worker on all FunctionsContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the function signatures
   * of a project.
   */
  static void ExposeProjectFunctions(gd::Project &project,
                                     gd::ArbitraryEventsFunctionsWorker &worker);

  /**
   * \brief Call the specified worker on all EventBasedBehavior of a project.
   *
   * This should be the preferred way to traverse all the event-based behavior
   * of a project.
   */
  static void ExposeProjectEventBasedBehaviors(
      gd::Project &project, gd::ArbitraryEventBasedBehaviorsWorker &worker);

  /**
   * \brief Call the specified worker on all SharedData of a project.
   *
   * This should be the preferred way to traverse all the shared data
   * of a project.
   */
  static void ExposeProjectSharedDatas(gd::Project &project,
                                       gd::ArbitraryBehaviorSharedDataWorker &worker);
};

} // namespace gd
